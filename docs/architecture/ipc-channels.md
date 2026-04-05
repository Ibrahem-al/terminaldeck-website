# IPC Channels

All IPC communication between the main process and renderer goes through the preload bridge (`src/main/preload.ts`), exposed as `window.terminalDeck`. The main process handlers are split between `src/main/main.ts` and `src/main/pty/ptyIpc.ts`.

## Channel Reference

### PTY Channels

| Channel | Direction | Pattern | Payload | Purpose |
|---------|-----------|---------|---------|---------|
| `pty:create` | renderer -> main | `invoke`/`handle` | `{ id, shell?, cwd?, startupCommands? }` | Spawn or reconnect to a PTY process |
| `pty:input` | renderer -> main | `send`/`on` | `{ id, data }` | Send keyboard input to PTY |
| `pty:resize` | renderer -> main | `send`/`on` | `{ id, cols, rows }` | Resize PTY terminal dimensions |
| `pty:kill` | renderer -> main | `invoke`/`handle` | `{ id }` | Kill a PTY process |
| `pty:data` | main -> renderer | `send`/`on` | `{ id, data }` | Stream PTY output to renderer |
| `pty:exit` | main -> renderer | `send`/`on` | `{ id, exitCode }` | Notify renderer when PTY exits |

**Notes:**
- `pty:input` and `pty:resize` use fire-and-forget (`send`/`on`) for performance -- no response needed.
- `pty:data` and `pty:exit` are pushed from main to renderer via `event.sender.send()` (the `webContents` of the window that created the PTY).
- `pty:create` returns `{ success: true, reconnected?: boolean }` or `{ success: false, error: string }`. When `reconnected` is `true`, an existing PTY was reattached (e.g., after sleep/wake) — startup commands are NOT re-executed.
- `pty:kill` returns `{ success: true }` or `{ success: false, error: string }`.

### State Persistence Channels

| Channel | Direction | Pattern | Payload | Purpose |
|---------|-----------|---------|---------|---------|
| `state:save` | renderer -> main | `invoke`/`handle` | `AppState` object | Save state to disk |
| `state:load` | renderer -> main | `invoke`/`handle` | none | Load state from disk |

**Notes:**
- `state:load` returns `AppState | null` (null if file doesn't exist or is corrupted).
- `state:save` is debounced in the renderer (500ms) before being sent.

### Window Control Channels

| Channel | Direction | Pattern | Payload | Purpose |
|---------|-----------|---------|---------|---------|
| `window:minimize` | renderer -> main | `send`/`on` | none | Minimize the app window |
| `window:maximize` | renderer -> main | `send`/`on` | none | Toggle maximize/restore |
| `window:close` | renderer -> main | `send`/`on` | none | Close the app window |
| `window:isMaximized` | renderer -> main | `invoke`/`handle` | none | Check if window is maximized |

### Dialog Channels

| Channel | Direction | Pattern | Payload | Purpose |
|---------|-----------|---------|---------|---------|
| `dialog:openFolder` | renderer -> main | `invoke`/`handle` | none | Open native folder picker dialog |
| `dialog:saveFile` | renderer -> main | `invoke`/`handle` | none | Open native save dialog |
| `dialog:openFile` | renderer -> main | `invoke`/`handle` | none | Open native open dialog for files |

- `dialog:openFolder` returns `string | null` (selected path, or null if cancelled).
- `dialog:saveFile` returns `string | null` (selected file path, or null if cancelled).
- `dialog:openFile` returns `string | null` (selected file path, or null if cancelled).

### File I/O Channels

| Channel | Direction | Pattern | Payload | Purpose |
|---------|-----------|---------|---------|---------|
| `file:write` | renderer -> main | `invoke`/`handle` | `{ filePath, content }` | Write string content to a file path |
| `file:read` | renderer -> main | `invoke`/`handle` | `{ filePath }` | Read file content as string |

**Notes:**
- `file:write` returns `{ success: boolean, error?: string }`.
- `file:read` returns `{ success: boolean, content?: string, error?: string }`.
- These channels are used by the Data tab in Settings for import/export operations (layout presets and app settings).

### Window Embedding Channels (DWM Thumbnails)

| Channel | Direction | Pattern | Payload | Purpose |
|---------|-----------|---------|---------|---------|
| `window:list` | renderer -> main | `invoke`/`handle` | none | List available OS windows |
| `window:embed` | renderer -> main | `invoke`/`handle` | `{ hwnd, instanceId }` | Embed window via DWM thumbnail |
| `window:release` | renderer -> main | `invoke`/`handle` | `{ instanceId }` | Release an embedded window |
| `window:updateBounds` | renderer -> main | `send`/`on` | `{ instanceId, bounds, dpr }` | Update thumbnail position & source position |
| `window:setVisible` | renderer -> main | `send`/`on` | `{ instanceId, visible }` | Show/hide thumbnail (for minimize/restore) |
| `window:forwardInput` | renderer -> main | `send`/`on` | `{ instanceId, event }` | Forward mouse/keyboard events to source |
| `window:getSourceSize` | renderer -> main | `invoke`/`handle` | `{ instanceId }` | Get source window dimensions |
| `window:focus` | renderer -> main | `invoke`/`handle` | `{ hwnd }` | Focus an external window |
| `window:sourceClosed` | main -> renderer | `send`/`on` | `{ instanceId }` | Notify when source window is closed externally |
| `window:getMediaSourceId` | renderer -> main | `invoke`/`handle` | `{ instanceId }` | Get desktopCapturer source ID (macOS fallback) |
| `window:frame` | main -> renderer | `send`/`on` | `{ instanceId, data, width, height }` | Stream BGRA frame pixels (macOS native capture) |

**Notes:**
- `window:list` returns `{ hwnd: number; title: string; processName: string }[]`
- `window:embed` returns `{ success: boolean; sourceWidth: number; sourceHeight: number }`. It reads the Electron window's native handle via `mainWindow.getNativeWindowHandle()`.
- `window:updateBounds` uses fire-and-forget (`send`/`on`) since it's called at ~20fps for position tracking. `bounds` is in CSS pixels; `dpr` is `window.devicePixelRatio` for DPI conversion.
- `window:forwardInput` is fire-and-forget. The `event` object contains `{ type, x?, y?, button?, deltaY?, vkCode?, thumbWidth?, thumbHeight?, ctrlKey?, shiftKey? }`.
- `window:sourceClosed` is pushed from main to renderer when the health check detects a source window has been closed.

## Preload Bridge API

The preload script (`src/main/preload.ts`) exposes the following typed API on `window.terminalDeck`:

```typescript
interface TerminalDeckAPI {
  // PTY
  ptyCreate(id: string, options: { shell?, cwd?, startupCommands? }): Promise<void>;
  ptyInput(id: string, data: string): void;
  ptyResize(id: string, cols: number, rows: number): void;
  ptyKill(id: string): Promise<void>;
  onPtyData(id: string, callback: (data: string) => void): () => void;
  onPtyExit(id: string, callback: (exitCode: number) => void): () => void;

  // State
  stateSave(state: any): Promise<void>;
  stateLoad(): Promise<any>;

  // Window Controls
  windowMinimize(): void;
  windowMaximize(): void;
  windowClose(): void;
  windowIsMaximized(): Promise<boolean>;

  // Dialog
  openFolderDialog(): Promise<string | null>;
  saveFileDialog(): Promise<string | null>;
  openFileDialog(): Promise<string | null>;

  // File I/O
  fileWrite(filePath: string, content: string): Promise<{ success: boolean; error?: string }>;
  fileRead(filePath: string): Promise<{ success: boolean; content?: string; error?: string }>;

  // Window Embedding (DWM Thumbnails)
  windowList(): Promise<{ hwnd, title, processName }[]>;
  windowEmbed(hwnd: number, instanceId: string): Promise<{ success, sourceWidth, sourceHeight }>;
  windowRelease(instanceId: string): Promise<boolean>;
  windowUpdateBounds(instanceId: string, bounds: { x, y, width, height }, dpr: number): void;
  windowSetVisible(instanceId: string, visible: boolean): void;
  windowForwardInput(instanceId: string, event: any): void;
  windowGetSourceSize(instanceId: string): Promise<{ width, height } | null>;
  windowFocus(hwnd: number): Promise<void>;
  windowGetMediaSourceId(instanceId: string): Promise<string | null>;  // macOS
  onWindowFrame(callback: (instanceId: string, data: ArrayBuffer, width: number, height: number) => void): () => void;  // macOS
  onWindowSourceClosed(callback: (instanceId: string) => void): () => void;
}
```

**Important:** The `onPtyData` and `onPtyExit` methods filter events by instance ID client-side. The main process sends all PTY data on a single `pty:data` channel with `{ id, data }` payloads, and each listener checks `payload.id === id` before invoking the callback. The returned function removes the listener when called.
