# Component Tree

Complete React component hierarchy with props and portal usage.

## Tree Diagram

```
<React.StrictMode>
  <ThemeProvider>                    [src/renderer/theme/ThemeProvider.tsx]
    <ToastProvider>                  [src/renderer/components/Toast/ToastManager.tsx]
      <App>                          [src/renderer/App.tsx]
        |
        +-- <AppTitleBar>            [src/renderer/components/AppTitleBar.tsx]
        |     props: onToggleSidebar, sidebarVisible, onOpenSearch
        |     (has a clickable search bar button in the center; clicking opens GlobalSearch)
        |
        +-- <Sidebar>               [src/renderer/components/Sidebar/Sidebar.tsx]
        |     props: onOpenSettings, onOpenLayouts
        |     |
        |     +-- <WorkspaceSwitcher>    [src/renderer/components/Sidebar/WorkspaceSwitcher.tsx]
        |     |     props: workspaces, activeWorkspaceId, onSwitch, onCreateWorkspace
        |     |
        |     +-- <ProjectItem>          [src/renderer/components/Sidebar/ProjectItem.tsx]
        |     |     props: project, allProjects, workspaceId, onRename*, onChange*, onDelete*, onFocus*, ...
        |     |     (context menu has "New Instance" as its first item)
        |     |     |
        |     |     +-- <InstanceItem>   [src/renderer/components/Sidebar/InstanceItem.tsx]
        |     |     |     props: instance, workspaceId, projects, onFocus, onRename, onDelete, onMoveToProject, onRestore
        |     |     |     PORTAL: context menu -> document.body
        |     |     |
        |     |     +-- PORTAL: context menu -> document.body
        |     |     +-- PORTAL: <ProjectSettingsDialog> -> document.body
        |     |
        |     +-- <InstanceItem> (ungrouped terminals)
        |     +-- <InstanceItem> (embedded windows section)
        |     |
        |     +-- PORTAL: <NewProjectDialog> -> document.body
        |     +-- PORTAL: <WindowPicker> -> document.body
        |     +-- PORTAL: <DeleteProjectDialog> -> document.body
        |
        +-- <Canvas>                 [src/renderer/components/Canvas/Canvas.tsx]
        |     (no props -- reads from store)
        |     |
        |     +-- <CanvasPanel>      [src/renderer/components/Canvas/CanvasPanel.tsx]
        |     |     props: instance, children
        |     |     |
        |     |     +-- <TitleBar>   [src/renderer/components/TitleBar/TitleBar.tsx]
        |     |     |     props: instance, onDragStart, onOpenSettings
        |     |     |     |
        |     |     |     +-- <IndicatorLight>  [src/renderer/components/IndicatorLight.tsx]
        |     |     |     |     props: state, size?
        |     |     |     |
        |     |     |     +-- <ContextMenu>     [src/renderer/components/TitleBar/ContextMenu.tsx]
        |     |     |           props: items, position, onClose
        |     |     |           (rendered inline, NOT portalled)
        |     |     |
        |     |     +-- <TerminalPanel>          [src/renderer/components/TerminalPanel.tsx]
        |     |     |     props: instanceId
        |     |     |     (OR)
        |     |     +-- <EmbeddedPanelContent>   [src/renderer/components/EmbeddedPanel/EmbeddedPanelContent.tsx]
        |     |     |     props: instance
        |     |     |
        |     |     +-- <ResizeHandle> x5        [src/renderer/components/Canvas/ResizeHandle.tsx]
        |     |     |     props: direction, instanceId, position, size, onResize
        |     |     |
        |     |     +-- PORTAL: <InstanceSettingsDialog> -> document.body
        |     |
        |     +-- <SnapGuides>       [src/renderer/components/Canvas/SnapGuides.tsx]
        |           props: guides
        |
        +-- <SettingsPanel>          [src/renderer/components/Settings/SettingsPanel.tsx]
        |     props: open, onClose
        |     |
        |     +-- <GeneralTab> | <AppearanceTab> | <CanvasTab> | <NotificationsTab> | <StartupTab> | <DataTab>
        |     +-- <ConfirmDialog>    (conditional, inline)
        |
        +-- <LayoutPicker>          [src/renderer/components/LayoutPicker.tsx]
        |     props: onClose
        |     4 buttons: Grid, Columns, Rows, Full Screen
        |
        +-- <FocusOverlay>          [src/renderer/components/FocusMode/FocusOverlay.tsx]
        |     props: active, onExit
        |
        +-- <CommandPalette>        [src/renderer/components/CommandPalette/CommandPalette.tsx]
        |     props: isOpen, onClose
        |
        +-- <GlobalSearch>          [src/renderer/components/CommandPalette/GlobalSearch.tsx]
              props: isOpen, onClose
```

## Portal Usage

Several components use `createPortal(element, document.body)` to render outside their parent's DOM subtree:

| Component | Portal Target | Reason |
|-----------|--------------|--------|
| InstanceItem context menu | document.body | Sidebar has `overflow: hidden` |
| ProjectItem context menu | document.body | Sidebar has `overflow: hidden` |
| ProjectItem color picker | document.body | Nested in context menu |
| NewProjectDialog | document.body | Sidebar has `overflow: hidden` |
| WindowPicker | document.body | Sidebar has `overflow: hidden` |
| DeleteProjectDialog | document.body | Sidebar has `overflow: hidden` |
| ProjectSettingsDialog | document.body | Sidebar has `overflow: hidden` |
| InstanceSettingsDialog | document.body | Canvas transform would scale/offset the dialog |

The canvas transform (`translate + scale`) is the key reason panel-level dialogs must be portalled -- without portalling, the dialog would be scaled and offset by the canvas zoom and pan.

## Key Component Details

### App (`src/renderer/App.tsx`)
- SIDEBAR_WIDTH constant: 260
- Manages state for settingsOpen, layoutPickerOpen
- Calls `restoreInstances()` once on mount
- Canvas area shifts right when sidebar is visible

### Canvas (`src/renderer/components/Canvas/Canvas.tsx`)
- Uses `useCanvas()` hook for pan/zoom interaction
- Uses `useShallow` for instance array comparison
- Renders `CanvasPanel` for each non-minimized instance
- Shows empty state message when no instances

### CanvasPanel (`src/renderer/components/Canvas/CanvasPanel.tsx`)
- Wraps each instance with TitleBar, content, and ResizeHandles
- Manages live resize state locally (committed to store on mouseup)
- Applies focus styling (blue shadow) and focus-mode dimming
- Border uses the instance's project color (at 25% opacity) when `showProjectBorders` is enabled in settings
- Resize directions: s, e, w, sw, se (no top/north handles -- title bar is the drag area)

### TerminalPanel (`src/renderer/components/TerminalPanel.tsx`)
- Reads shell, workingDirectory, startupCommands from store via fine-grained selectors
- Creates useTerminal hook with indicator light callbacks
- Manages xterm focus/blur based on focusedInstanceId
- Claims focus on mousedown
- Calls `indicatorDismiss()` on click and focus to clear green/yellow indicator lights

### EmbeddedPanelContent

Window embedding is enabled in the UI. The sidebar has a visible "+ Embed Window" button that opens the WindowPicker portal.

`src/renderer/components/EmbeddedPanel/EmbeddedPanelContent.tsx` — On Windows, this IS the Windows implementation (DWM Thumbnails with child-window-aware input forwarding). In macOSDev, this is a platform dispatcher that renders `MacEmbeddedContent` or `WindowsEmbeddedContent`.

**Windows (`EmbeddedPanelContent.tsx` or `WindowsEmbeddedContent.tsx`):**
- Displays a live DWM thumbnail of an external window
- Polls `getBoundingClientRect` at ~20fps to update thumbnail position (DPI-aware)
- Invisible input capture layer (tabIndex=0 div) intercepts mouse/keyboard events
- Forwards mouse events via SetForegroundWindow + PostMessage (throttled to ~60fps)
- Forwards keyboard events via SetForegroundWindow + PostMessage (DOM code → Win32 VK code mapping)
- Blocks browser context menu for right-click forwarding
- Subtle focus indicator (inner box-shadow) when keyboard-focused
- Hides thumbnail on unmount (minimize), shows on remount

**macOS (`MacEmbeddedContent.tsx`):**
- Receives BGRA frames from main process via `onWindowFrame` IPC, renders to `<canvas>` (BGRA→RGBA swap)
- Falls back to desktopCapturer `MediaStream` → `<video>` element after 500ms if no native frames arrive
- Same input capture overlay for mouse/keyboard forwarding
- Uses macOS-specific keycodes (`macKeyCodes.ts`) instead of Win32 VK codes

### TitleBar (`src/renderer/components/TitleBar/TitleBar.tsx`)
- 38px height panel title bar
- Supports 'minimal' and 'hideable' modes
- Inline rename on double-click
- Right-click context menu with submenu support
- Embedded instances show orange background and app icon

### ContextMenu (`src/renderer/components/TitleBar/ContextMenu.tsx`)
- Generic context menu with one level of submenu support
- Uses fixed positioning at click coordinates
- Closes on outside click (with delayed listener) and Escape key
- Each item supports `onClick` or `submenu` (array of sub-items)

### CommandPalette (`src/renderer/components/CommandPalette/CommandPalette.tsx`)
- Ctrl+Shift+P to toggle
- Fuzzy search via `fuzzyFilter` from `src/renderer/utils/fuzzySearch.ts`
- Actions from `actionRegistry.ts` (instances, projects, workspaces, layout, view, settings, theme)
- Keyboard navigation: Up/Down/Enter/Escape

### GlobalSearch (`src/renderer/components/CommandPalette/GlobalSearch.tsx`)
- Ctrl+Shift+F to toggle, or click the search bar in AppTitleBar
- Searches instance names (from store) in addition to terminal output buffers via `searchAll()` from `outputBuffer.ts`
- Name matches appear first, displayed with accent color and an "instance" label
- Debounced search (150ms)
- Results limited to 200 for UI performance
- Selecting a result calls `scrollToInstance()` (pans canvas to center the instance and focuses it) instead of just `setFocusedInstance()`

### NotificationsTab
- 3 rows: desktop notifications toggle, sound notifications toggle, volume slider
- Volume slider is conditionally rendered (only shown when sound notifications are enabled)

### GeneralTab
- Includes a "Keyboard Shortcuts" section with a focus mode hotkey dropdown (default F11)

### Toast system
- `ToastProvider` wraps the app and provides `showToast(message, type?)` via context
- `Toast` component renders individual notifications with slide-in/out animation
- Auto-dismiss after 5 seconds
- Max 5 visible simultaneously
- Types: info (blue), success (green), warning (yellow)
