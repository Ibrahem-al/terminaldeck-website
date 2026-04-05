# Window Embedding

> **Status: Enabled.** The window embedding feature is fully implemented and active. The "Embed Window" button and WindowPicker dialog are visible in `Sidebar.tsx`.

TerminalDeck can embed external OS windows inside the canvas alongside terminal panels. The implementation differs by platform — Windows uses DWM Thumbnails for zero-copy GPU compositing, macOS uses CGWindowListCreateImage or desktopCapturer for frame streaming.

## Platform Comparison

| Aspect | Windows | macOS |
|--------|---------|-------|
| **Capture** | DWM Thumbnail API — zero-copy GPU texture in compositor | CGWindowListCreateImage (native addon) or desktopCapturer (fallback) |
| **Frame rate** | Display refresh rate (60-144Hz) | ~30fps |
| **Latency** | Near-zero (compositor-level) | ~30-50ms (frame copy + render) |
| **Cursor in capture** | Not included (DWM thumbnails are cursor-free) | Not included with native addon; included with desktopCapturer fallback |
| **Input: mouse** | ChildWindowFromPoint + PostMessage to deepest child window | CGEventPost to kCGHIDEventTap + NSRunningApplication activation |
| **Input: keyboard** | PostMessage to target child window (no SetForegroundWindow) | CGEventPost to kCGHIDEventTap + NSRunningApplication activation |
| **Permissions** | None required | Screen Recording + Accessibility |
| **Window hiding** | Source positioned behind Electron (HWND_BOTTOM) | Source stays visible (no equivalent to HWND_BOTTOM) |
| **Popup handling** | Popup monitor detects & brings dialogs to front | Not implemented (popups appear normally) |
| **Native code** | koffi FFI (no compilation needed) | Objective-C++ addon via node-gyp (requires Xcode CLT) |
| **Renderer component** | `EmbeddedPanelContent.tsx` — invisible div over DWM thumbnail | `MacEmbeddedContent.tsx` — `<canvas>` (native) or `<video>` (fallback) |

## Architecture — Windows

```
Renderer                            Main Process
  |                                   |
  | window:list ───────────────────>  | koffi EnumWindows + GetWindowTextW
  | <── WindowInfo[] ──────────────  |
  |                                   |
  | window:embed(hwnd, instanceId) ─> | DwmRegisterThumbnail + position behind Electron
  | <── { success, sourceW, sourceH } |
  |                                   |
  | window:updateBounds(id, b, dpr) > | DwmUpdateThumbnailProperties
  | (20fps polling)                   | + SetWindowPos(source, HWND_BOTTOM)
  |                                   |
  | window:forwardInput(id, event) ─> | ChildWindowFromPoint + PostMessage to child
  | (on user interaction)             |
  |                                   |
  | window:release(instanceId) ─────> | DwmUnregisterThumbnail + restore position
  | <── boolean ───────────────────  |
```

## Architecture — macOS

```
Renderer                            Main Process
  |                                   |
  | window:list ───────────────────>  | Native addon CGWindowListCopyWindowInfo
  | <── WindowInfo[] ──────────────  |   (or desktopCapturer.getSources fallback)
  |                                   |
  | window:embed(windowId, instId) ─> | Start native capture loop (30fps)
  | <── { success, sourceW, sourceH } |   (or store desktopCapturer mediaSourceId)
  |                                   |
  | <── window:frame (IPC) ─────────  | CGWindowListCreateImage → BGRA pixels
  | Render to <canvas>                |   (native addon path, no cursor)
  |    OR                             |
  | getUserMedia(mediaSourceId)       |   (desktopCapturer fallback)
  | Render to <video>                 |
  |                                   |
  | window:forwardInput(id, event) ─> | CGEventPost(kCGHIDEventTap) + app activation
  |                                   |
  | window:release(instanceId) ─────> | Stop capture loop
```

---

## Windows Implementation

### DWM Thumbnail Approach

The Desktop Window Manager (DWM) Thumbnail API provides zero-copy GPU-composited live rendering:

1. `DwmRegisterThumbnail(electronHwnd, sourceHwnd)` creates a compositor-level relationship
2. DWM renders the source window's texture at the specified destination rectangle
3. Works with ALL windows including GPU-accelerated apps (Chrome, VS Code, Discord)
4. Near-zero CPU usage — it's a texture reference in the DWM compositor
5. Updates at display refresh rate (60Hz, 144Hz, etc.)

### Native Modules (Windows)

Located in `src/main/native/`:

| File | Purpose |
|------|---------|
| `win32Types.ts` | Shared koffi struct definitions (RECT, SIZE, POINT, DWM_THUMBNAIL_PROPERTIES) |
| `dwmThumbnail.ts` | DWM Thumbnail API wrapper — register, update, unregister thumbnails |
| `inputForwarder.ts` | Win32 input forwarding via ChildWindowFromPoint + MapWindowPoints + PostMessage to child windows |
| `windowEmbed.ts` | Orchestrator — factory function that lazy-loads Win32/macOS code behind platform checks |

All Win32 API calls use `koffi` with string-based function declarations. All koffi code is lazy-loaded inside the factory function so the module can be safely imported on macOS without crashing.

### Window Listing (Windows)

`getWindowList()` uses koffi-bound `EnumWindows` + `GetWindowTextW` + `GetWindowThreadProcessId` + `GetModuleBaseNameW` to enumerate visible top-level windows. Filters out invisible, tool, untitled, and system process windows.

### Embedding Process (Windows)

1. Save the window's current position via `GetWindowRect`
2. Register DWM thumbnail via `DwmRegisterThumbnail`
3. Query source dimensions via `DwmQueryThumbnailSourceSize`
4. Position source behind Electron at the same screen coordinates (`SetWindowPos` with `HWND_BOTTOM`)
5. On each `updateBounds` call: update DWM thumbnail destination rect and sync source position via `ClientToScreen`. The source window is NOT resized — DWM auto-scales the full source window into the destination rectangle, so the entire source window is visible at any panel size.
6. Start health check and popup monitor

### Input Forwarding (Windows)

Mouse and keyboard events are forwarded using `ChildWindowFromPoint` + `MapWindowPoints` to find the deepest child window at the click coordinates, then `PostMessageW` sends mouse/keyboard messages to that specific child window with locally-mapped coordinates. This fixes interaction with modern apps that use child windows (e.g., Chrome, VS Code).

Focus is managed without stealing z-order: instead of `SetForegroundWindow`, the forwarder uses `PostMessageW(WM_ACTIVATE)` + `PostMessageW(WM_SETFOCUS)` to prime the target window.

`WM_MOUSEWHEEL` messages correctly use screen coordinates in `lParam` via `ClientToScreen` conversion, matching the Win32 API specification.

### Popup Handling (Windows)

A 250ms popup monitor scans for windows spawned by the embedded process:
- **Inline** (menus `#32768`, tooltips `WS_EX_TOOLWINDOW`, captionless) — appear naturally on top
- **External** (has `WS_CAPTION`) — brought to `HWND_TOPMOST`, tracked in `activePopups` set

### Source Window Sizing (Windows)

The source window is NOT resized to match the panel dimensions. DWM auto-scales the full source window into the destination rectangle. This means:
- The entire source window is always visible regardless of panel size
- DWM handles the scaling in the compositor (GPU-accelerated)
- No app reflow occurs — the source app remains at its original size

---

## macOS Implementation

### Two Capture Paths

macOS has no equivalent to DWM Thumbnails. The implementation provides two capture paths:

**Path 1: Native addon (preferred)** — `CGWindowListCreateImage` captures a single window as a raw BGRA bitmap at ~30fps. This is **cursor-free** (no duplicate cursor). Frames are sent to the renderer via `window:frame` IPC and rendered onto a `<canvas>` element.

**Path 2: desktopCapturer fallback** — When the native addon isn't compiled, Electron's `desktopCapturer` provides a `MediaStream` rendered to a `<video>` element. This path includes the cursor in the capture (duplicate cursor visible) and requires Screen Recording permission.

The `embedWindow` method tries native capture first. If it fails (addon not compiled, permission denied), it falls back to `desktopCapturer` automatically.

### Native Modules (macOS)

Located in `macOSDev/src/main/native/`:

| File | Purpose |
|------|---------|
| `mac_input.mm` | Objective-C++ N-API addon — CGWindowList enumeration, CGEvent input forwarding, accessibility permission management |
| `binding.gyp` | node-gyp build config — links CoreGraphics, Foundation, ApplicationServices, AppKit frameworks |
| `macEmbed.ts` | macOS embed manager — window enumeration, dual-path capture, input forwarding coordination |

### Window Listing (macOS)

**Native addon:** `CGWindowListCopyWindowInfo(kCGWindowListOptionOnScreenOnly, kCGNullWindowID)` returns all on-screen windows with IDs, titles, owner names, PIDs, and bounds. Filters layer 0 only (normal windows). If Screen Recording isn't granted, window titles are empty — falls back to `ownerName` (app name).

**Fallback:** `desktopCapturer.getSources({ types: ['window'] })` lists windows without needing the native addon.

### Input Forwarding (macOS)

`CGEventPostToPid` is unreliable for background apps. Instead, the native addon:
1. Creates events with `CGEventSourceCreate(kCGEventSourceStateHIDSystemState)` (hardware-level source)
2. Activates the target app via `[NSRunningApplication activateWithOptions:]`
3. For mouse clicks: warps cursor via `CGWarpMouseCursorPosition`, then posts via `CGEventPost(kCGHIDEventTap)`
4. For keyboard: activates target, posts via `CGEventPost(kCGHIDEventTap)`
5. After mouse up / key up: re-activates Electron via `dispatch_after` (100ms delay)

All synthetic events are tagged with `kCGEventSourceUserData = 0x5444` for identification.

**Permissions required:** Accessibility (System Settings > Privacy > Accessibility). The addon checks `AXIsProcessTrusted()` on startup and prompts if not granted.

### macOS Keycode Mapping

macOS uses hardware scan codes (CGKeyCode), different from Win32 VK codes. `macKeyCodes.ts` provides `DOM_CODE_TO_MAC` mapping (~60 entries). The renderer detects macOS via `navigator.userAgent` and uses `mapKeyToMacCode` instead of `mapKeyToVK`.

### Copy/Paste (macOS)

Terminal copy/paste uses Cmd (metaKey) instead of Ctrl:
- **Cmd+C** with selection → copy (no SIGINT)
- **Ctrl+C** → SIGINT (standard macOS terminal behavior)
- **Cmd+V** → paste from clipboard

---

## Renderer Components

### Platform Dispatcher (`EmbeddedPanelContent.tsx` — macOSDev only)

On macOS, this is a thin dispatcher:
```tsx
const isMac = /mac/i.test(navigator.userAgent);
return isMac ? <MacEmbeddedContent /> : <WindowsEmbeddedContent />;
```

On Windows, this file IS the Windows implementation directly (no dispatcher needed since macOS code isn't present).

### Windows: `EmbeddedPanelContent.tsx` (or `WindowsEmbeddedContent.tsx` in macOSDev)

- Polls `getBoundingClientRect` at 20fps → sends `windowUpdateBounds` IPC
- Invisible input capture `<div>` with `tabIndex={0}` intercepts DOM events despite DWM thumbnail being visually on top (compositor overlay ≠ DOM layer)
- DPI-aware: multiplies bounds by `devicePixelRatio`

### macOS: `MacEmbeddedContent.tsx`

- Subscribes to `onWindowFrame` IPC for native BGRA frames → renders to `<canvas>` (BGRA→RGBA swap)
- After 500ms with no native frames, falls back to `desktopCapturer` `MediaStream` → `<video>` element
- Same input capture overlay as Windows (mouse/keyboard forwarding)

---

## Common Features (Both Platforms)

### WindowPicker Dialog

`WindowPicker.tsx` — modal styled like command palette:
- Fetches window list via `windowList()` IPC
- Text filter by title or process/app name
- Keyboard navigation (arrows, Enter, Escape)

### Sidebar Integration

The "Embed Window" button:
1. Opens WindowPicker
2. Pre-generates `instanceId` via `crypto.randomUUID()`
3. Calls `windowEmbed(hwnd, instanceId)`
4. On success: `createEmbeddedInstance()` adds to store
5. On failure: no instance created

### Health Check

Both platforms run a 2-second interval checking if source windows still exist. On Windows: `IsWindow(hwnd)`. On macOS: compares against `CGWindowListCopyWindowInfo` results.

### IPC Channels

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `window:list` | renderer → main | List available windows |
| `window:embed` | renderer → main | Start embedding a window |
| `window:release` | renderer → main | Stop embedding, restore window |
| `window:updateBounds` | renderer → main | Update thumbnail/source position (20fps) |
| `window:setVisible` | renderer → main | Show/hide on minimize/restore |
| `window:forwardInput` | renderer → main | Forward mouse/keyboard events |
| `window:getSourceSize` | renderer → main | Get source window dimensions |
| `window:getMediaSourceId` | renderer → main | Get desktopCapturer source ID (macOS) |
| `window:frame` | main → renderer | Stream BGRA frame data (macOS native) |
| `window:sourceClosed` | main → renderer | Notify when source window closes |
| `window:focus` | renderer → main | Focus an external window |

---

## Limitations

### Windows
- **Keyboard forwarding:** Apps relying on `GetAsyncKeyState` or `RawInput` may not respond
- **Exclusive fullscreen:** Bypasses DWM → stale thumbnail
- **Minimized source:** Shows last frame before minimization

### macOS
- **~30fps** capture rate (vs display refresh on Windows)
- **~30-50ms latency** on the video feed
- **Orange menubar dot** during capture (macOS requirement)
- **Mouse forwarding is PID-level** — can't target a specific window if the app has multiple
- **desktopCapturer fallback** includes cursor (duplicate cursor visible)
- **Requires permissions:** Screen Recording + Accessibility
- **No popup monitoring** — dialogs appear normally, not brought to front

### Both Platforms
- Source window must remain open (closing it removes the embedded panel)
- Window embedding is separate from terminal instances — embedded windows don't have PTY/shell integration

## Development Notes

### Hot Reload

Vite HMR only updates the **renderer** (React components). Changes to main process files (`windowEmbed.ts`, `inputForwarder.ts`, `dwmThumbnail.ts`, `macEmbed.ts`, `preload.ts`, `main.ts`) require a full rebuild and Electron restart:
```bash
npm run build
npm run dev:electron  # or npm run start
```

### macOS Native Addon Build

```bash
cd src/main/native && node-gyp rebuild  # or: npm run build:native
```

Requires Xcode Command Line Tools. If not compiled, the app falls back to `desktopCapturer` (no input forwarding, cursor visible in capture).
