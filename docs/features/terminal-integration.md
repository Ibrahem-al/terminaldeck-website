# Terminal Integration

TerminalDeck uses **xterm.js** (v5) for the terminal UI and **node-pty** (v1) for the pseudo-terminal backend.

## Architecture

```
Renderer (xterm.js)              Main (node-pty)
  |                                |
  |-- useTerminal hook creates     |
  |   Terminal instance            |
  |-- pty:create ----------------->|-- pty.spawn(shell, [], opts)
  |                                |   OR reconnect to existing PTY
  |<--------- pty:data -----------|-- ptyProcess.onData()
  |   terminal.write(data)         |
  |                                |
  |-- terminal.onData(data) ------>|
  |   pty:input                    |-- ptyProcess.write(data)
  |                                |
  |-- ResizeObserver fires ------->|
  |   fitAddon.fit()               |
  |   pty:resize(cols, rows)       |-- ptyProcess.resize(cols, rows)
  |                                |
  |<--------- pty:exit ------------|-- ptyProcess.onExit()
```

## xterm.js Setup

The terminal is configured in `src/renderer/hooks/useTerminal.ts`:

```typescript
const terminal = new Terminal({
  cursorBlink: true,
  fontFamily: 'Cascadia Code, Menlo, "DejaVu Sans Mono", Consolas, monospace',
  fontSize: 14,
  allowProposedApi: true,
  theme: {
    background: '#0f0f1a',
    foreground: '#e0e0e0',
    cursor: '#e0e0e0',
  },
});
```

The `FitAddon` is loaded to auto-fit the terminal to its container size.

## useTerminal Hook (`src/renderer/hooks/useTerminal.ts`)

### Deferred open

xterm.js v5 crashes if opened into a zero-size container. The hook uses `requestAnimationFrame` polling to wait until the container has non-zero dimensions before calling `terminal.open(container)`.

```
tryOpen() -> check rect -> if 0 size -> requestAnimationFrame(tryOpen)
                        -> if non-zero -> init()
```

### Initialization flow (init function)

1. Create `Terminal` instance with config
2. Attach custom key event handler for copy/paste
3. Create and load `FitAddon`
4. Open terminal in container
5. Initial fit
6. Subscribe to `pty:data` **before** creating PTY (to not miss early output)
7. Subscribe to `pty:exit`
8. Call `ptyCreate()` IPC — this either creates a new PTY or **reconnects** to an existing one (see Sleep/Wake Resilience below)
9. When PTY is ready (`ptyReady = true`):
   - Fit again and send initial size via `ptyResize`
10. Attach `terminal.onData` listener (only sends when `ptyReady`)
11. Attach `ResizeObserver` on container

### ptyReady flag

Input and resize commands are only sent to the main process after `ptyCreate()` resolves. Before that, keystrokes are captured by xterm.js but not forwarded. This prevents errors from sending data to a not-yet-spawned PTY.

### Cleanup

On unmount (or instanceId change):
1. Set `disposed = true` (prevents async callbacks from writing to destroyed terminal)
2. Disconnect ResizeObserver
3. Dispose terminal data listener
4. Unsubscribe from pty:data and pty:exit
5. Dispose the Terminal instance

**Note:** The PTY is **not** killed by useTerminal. PTY cleanup is handled by `useInstanceLifecycle.deleteInstance()` or the `before-quit` event in main.

## Sleep/Wake Resilience

When the laptop sleeps and wakes, Chromium may recycle the renderer process, causing React to remount all `TerminalPanel` components. The PTY processes in the main process survive sleep.

### The reconnect mechanism

In `src/main/pty/ptyIpc.ts`, the `pty:create` handler checks if a PTY with the requested ID already exists:

1. **PTY exists** (sleep/wake scenario): Calls `ptyManager.reconnect(id)` which clears stale data/exit listeners without killing the process. New listeners are registered on the fresh renderer sender. Startup commands are NOT re-executed. Returns `{ success: true, reconnected: true }`.

2. **PTY does not exist** (fresh creation): Calls `ptyManager.create(id, ...)` as normal, registers listeners, executes startup commands. Returns `{ success: true, reconnected: false }`.

### PtyManager methods for reconnection

Located in `src/main/pty/ptyManager.ts`:

- `has(id)`: Returns `true` if a PTY with this ID exists in the map
- `reconnect(id)`: Clears `dataListeners` and `exitListeners` arrays without killing the PTY process. Returns `true` if found.

This ensures long-running sessions (Claude, SSH, etc.) survive sleep/wake seamlessly.

## Copy/Paste

Handled by a custom key event handler attached to the terminal:

- **Ctrl+C with selection:** Copies the terminal selection to clipboard, clears selection. Does NOT send SIGINT.
- **Ctrl+C without selection:** Passes through to the terminal normally (SIGINT)
- **Ctrl+V:** Reads from clipboard via `navigator.clipboard.readText()` and sends to PTY via `ptyInput`. Uses `e.preventDefault()` to block the browser's native paste and avoid duplicate input.
- **Ctrl+Shift+C:** Always copies selection to clipboard
- **Ctrl+Shift+V:** Also pastes from clipboard

## Scrollback

Terminal scrollback is handled by xterm.js natively. The canvas's wheel event handler detects when the cursor is inside a terminal panel (via `.xterm` / `.xterm-viewport` DOM classes) and lets xterm handle scroll events first. Only when the terminal reaches a scroll boundary (top or bottom of scrollback) and the user scrolls again in the same direction does the canvas pan instead. This prevents accidental canvas movement while reading terminal history.

## Resize Handling

1. A `ResizeObserver` watches the terminal container div
2. On resize, `fitAddon.fit()` is called to recalculate terminal dimensions
3. If `ptyReady` and dimensions are valid (cols > 0, rows > 0), `ptyResize(id, cols, rows)` is sent to the main process
4. The main process calls `ptyProcess.resize(cols, rows)` on the node-pty instance

## Shell Detection (`src/main/pty/shellDetect.ts`)

### Default shell priority

**Windows:**
1. `C:\Program Files\PowerShell\7\pwsh.exe` (PowerShell 7)
2. `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe` (Windows PowerShell)
3. `C:\Windows\System32\cmd.exe` (Command Prompt)

**macOS/Linux:**
1. `$SHELL` environment variable
2. `/bin/zsh`
3. `/bin/bash`
4. `/bin/sh`

### Available shells

`getAvailableShells()` returns all detected shells on the system. On Windows, it also checks for Git Bash at `Program Files/Git/bin/bash.exe` and `Program Files/Git/usr/bin/bash.exe`.

## PtyManager (`src/main/pty/ptyManager.ts`)

Manages PTY instances in a `Map<string, PtyEntry>`.

### PtyEntry structure
```typescript
interface PtyEntry {
  process: pty.IPty;
  dataListeners: Array<(data: string) => void>;
  exitListeners: Array<(exitCode: number) => void>;
}
```

### Key behaviors

- **Create:** If a PTY with the same ID already exists (e.g., React StrictMode double-mount), it kills the old one first before spawning. For sleep/wake reconnection, use `has()` + `reconnect()` instead of `create()`.
- **Reconnect:** Clears stale listeners without killing the PTY process — preserves the running session.
- **Spawn options:** `name: 'xterm-256color'`, initial size 80x24, environment inherits from `process.env` plus any overrides.
- **Auto-cleanup:** On PTY exit, the entry is automatically removed from the map.
- **killAll:** Called during `app.on('before-quit')` to ensure all PTYs are cleaned up.

## TerminalPanel Component (`src/renderer/components/TerminalPanel.tsx`)

The React component that renders a terminal instance. It:

1. Reads instance-specific fields (shell, workingDirectory, startupCommands) from the store using fine-grained selectors
2. Creates `useTerminal` options with those fields plus indicator light callbacks
3. Calls `useTerminal(instanceId, containerRef, options)`
4. Manages focus/blur of the xterm terminal based on `focusedInstanceId`
5. Claims focus on mousedown inside the terminal area

## PTY IPC Registration (`src/main/pty/ptyIpc.ts`)

The `registerPtyIpc(ptyManager)` function sets up all PTY-related IPC handlers:

- `pty:create` -- Checks for existing PTY first (reconnect), otherwise spawns new PTY. Wires data/exit forwarding to renderer via `sender.send()`. Executes startup commands only on fresh creation.
- `pty:input` -- Writes to PTY (fire-and-forget, errors logged to console)
- `pty:resize` -- Resizes PTY (fire-and-forget, errors logged to console)
- `pty:kill` -- Kills PTY and returns success/failure
