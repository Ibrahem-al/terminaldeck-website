# Architecture Overview

## Process Model

TerminalDeck follows the standard Electron two-process architecture:

```
+--------------------------------------------------+
|                  MAIN PROCESS                     |
|  (Node.js — src/main/)                            |
|                                                    |
|  +-------------+  +------------+  +-----------+   |
|  | PtyManager  |  | Persistence|  | WindowEmbed|  |
|  | (node-pty)  |  | (fs JSON)  |  | (DWM Thumb |  |
|  +-------------+  +------------+  |  + koffi)  |  |
|         |               |         +-----------+   |
|         |               |              |          |
|  +------+-------+-------+-------+------+-----+   |
|  |           IPC Main Handlers                |   |
|  +--------------------------------------------+   |
+-----|--------------------------------------------+
      | ipcMain <-> ipcRenderer (contextBridge)
+-----|--------------------------------------------+
|  +--v-----------------------------------------+   |
|  |        Preload Bridge (window.terminalDeck) |   |
|  +--------------------------------------------+   |
|                                                    |
|                 RENDERER PROCESS                   |
|  (Chromium — src/renderer/)                        |
|                                                    |
|  +----------+  +--------+  +------------------+   |
|  | Zustand   |  | React  |  | Engine (snap,   |   |
|  | Store     |  | Tree   |  |  collision,     |   |
|  | (immer +  |  |        |  |  layout, z-order|   |
|  |  persist) |  |        |  |  grouping)      |   |
|  +----------+  +--------+  +------------------+   |
+--------------------------------------------------+
```

### Main Process (`src/main/`)

- **`main.ts`** -- Entry point. Creates the `BrowserWindow` (frameless, 1400x900 default), registers IPC handlers for state persistence, window controls, dialog, and window embedding. Instantiates `PtyManager` and `WindowEmbedManager`.
- **`preload.ts`** -- Context bridge that exposes `window.terminalDeck` to the renderer. Typed API surface covering PTY, state, window controls, dialog, and window embedding.
- **`persistence.ts`** -- Reads/writes `state.json` to `%APPDATA%/TerminalDeck/` using synchronous `fs` operations.
- **`importExport.ts`** -- Export/import workspace state as JSON files (scrollback not included).
- **`pty/ptyManager.ts`** -- Manages `node-pty` instances in a `Map<string, PtyEntry>`. Each PTY has data and exit listener arrays.
- **`pty/ptyIpc.ts`** -- Registers `pty:create`, `pty:input`, `pty:resize`, `pty:kill` IPC handlers. Bridges renderer requests to `PtyManager` and streams data back via `webContents.send`. Supports PTY reconnection on sleep/wake.
- **`pty/shellDetect.ts`** -- Detects default shell (Windows: pwsh > powershell > cmd; macOS/Linux: $SHELL > zsh > bash).
- **`pty/startupCommands.ts`** -- Resolves cascade and executes startup commands with timing delays.
- **`native/windowEmbed.ts`** -- Platform-aware factory for window embedding. Lazy-loads Win32 code on Windows, macOS code on Darwin.
- **`native/win32Types.ts`** -- (Windows) Shared koffi struct definitions.
- **`native/dwmThumbnail.ts`** -- (Windows) DWM Thumbnail API wrapper via koffi.
- **`native/inputForwarder.ts`** -- (Windows) Input forwarding via SetForegroundWindow + PostMessage.
- **`native/macEmbed.ts`** -- (macOS, in macOSDev/) Window embed manager using CGWindowListCreateImage or desktopCapturer.
- **`native/mac_input.mm`** -- (macOS, in macOSDev/) Objective-C++ N-API addon for CGWindowList, CGEvent, accessibility.

### Renderer Process (`src/renderer/`)

- **Store** (`store/index.ts`) -- Single Zustand store with immer middleware for immutable updates and persist middleware for Electron IPC storage.
- **Hooks** (`hooks/`) -- Custom React hooks for canvas interaction, terminal lifecycle, panel drag, focus mode, keyboard shortcuts, and indicator lights.
- **Engine** (`engine/`) -- Pure functions for snap alignment, collision detection, cascade pushing, grouping, layout algorithms, preset management, and z-order.
- **Components** (`components/`) -- React component tree (see [Component Tree](../ui/component-tree.md)).
- **Theme** (`theme/`) -- CSS custom properties theme system with 4 built-in themes.
- **Utils** (`utils/`) -- Geometry helpers, fuzzy search, AI CLI detection, notification utilities.

## Data Flow Between Processes

All IPC communication goes through the preload bridge. See [IPC Channels](ipc-channels.md) for the complete channel list.

**Terminal data flow:**
```
Renderer                  Main
   |                       |
   |-- pty:create -------->|  (invoke/handle)
   |                       |-- node-pty.spawn()
   |<----- pty:data -------|  (send/on — streaming)
   |-- pty:input --------->|  (send/on — fire-and-forget)
   |-- pty:resize -------->|  (send/on — fire-and-forget)
   |-- pty:kill ---------->|  (invoke/handle)
   |<----- pty:exit -------|  (send/on — notification)
```

**State persistence flow:**
```
Renderer                  Main
   |                       |
   |-- state:save -------->|  (invoke/handle, debounced 500ms)
   |                       |-- fs.writeFileSync(state.json)
   |-- state:load -------->|  (invoke/handle, on app start)
   |<----- AppState -------|
```

## React Component Hierarchy

```
<ThemeProvider>
  <ToastProvider>
    <App>
      <AppTitleBar />
      <Sidebar>
        <WorkspaceSwitcher />
        <ProjectItem>
          <InstanceItem />
        </ProjectItem>
        <InstanceItem /> (ungrouped)
        <InstanceItem /> (embedded/windows section)
        <NewProjectDialog /> (portal)
        <WindowPicker /> (portal)
        <DeleteProjectDialog /> (portal)
      </Sidebar>
      <Canvas>
        <CanvasPanel>
          <TitleBar>
            <IndicatorLight />
            <ContextMenu /> (portal)
          </TitleBar>
          <TerminalPanel /> | <EmbeddedPanelContent />
          <ResizeHandle /> (x5: s, e, w, sw, se)
          <InstanceSettingsDialog /> (portal)
        </CanvasPanel>
        <SnapGuides />
      </Canvas>
      <SettingsPanel />
      <LayoutPicker />
      <FocusOverlay />
      <CommandPalette />
      <GlobalSearch />
    </App>
  </ToastProvider>
</ThemeProvider>
```

## State Management Approach

The app uses **Zustand + immer + persist**:

1. **Zustand** provides a single global store (`useStore`) with React hook selectors.
2. **immer** middleware enables writing mutable-looking code that produces immutable state updates.
3. **persist** middleware auto-saves state to Electron's main process via custom `electronStorage` adapter.
4. A secondary **snapGuidesStore** (plain Zustand, no persist) holds transient snap guide lines during drag operations.
5. A **zOrderStore** (plain Zustand, no persist) manages z-index ordering of panels on the canvas. This resets each session.
6. An **outputBuffer** (plain Map, not Zustand) stores terminal output lines per instance for global search.

## CSS Transform Canvas

The canvas uses a CSS transform approach rather than a virtual viewport:

```
<div ref={canvasRef} style={{ overflow: 'hidden' }}>     <!-- viewport -->
  <div style={{
    transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
    transformOrigin: '0 0',
    width: 0, height: 0     <!-- zero intrinsic size -->
  }}>
    <!-- Panels positioned absolutely in world coordinates -->
    <CanvasPanel style={{ position: 'absolute', left: x, top: y }} />
  </div>
</div>
```

- **Pan** is applied via `translate()` in the CSS transform
- **Zoom** is applied via `scale()` in the CSS transform
- **Panels** are positioned using `position: absolute` with `left`/`top` in world coordinates
- The inner div has zero intrinsic size -- panels float in infinite space
- During focus mode, a `transition: transform 400ms ease-out` is applied for smooth animation
