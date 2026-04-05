# Window Embedding Research: Displaying External OS Windows Inside Electron

**Date:** 2026-04-03  
**Platform:** Windows 10/11  
**Target:** Electron + React + TypeScript desktop app (TerminalDeck)

---

## 1. Executive Summary

After investigating 10+ approaches to embedding external application windows (Chrome, Discord, VS Code, etc.) inside an Electron app, the findings are:

### The Core Problem
Electron (Chromium) renders via GPU-accelerated DirectX. When you reparent an external GPU-rendered window into Electron's HWND tree via `SetParent`, the external window's rendering pipeline breaks — producing blank/grey rectangles for modern apps. This is a fundamental compositor conflict, not a bug.

### Most Promising Approaches (Ranked)

| Rank | Approach | Feasibility | Interactive? | GPU Apps? | Complexity |
|------|----------|------------|--------------|-----------|------------|
| 1 | **DWM Thumbnail + Input Forwarding** | 8/10 | Yes (via forwarding) | Yes | Medium |
| 2 | **SetParent (compatible) + DWM Thumbnail (fallback)** | 7/10 | Yes | Partial | High |
| 3 | **Windows.Graphics.Capture + Input Forwarding** | 7/10 | Yes (via forwarding) | Yes | High |
| 4 | **Native host app (Qt/WPF) + CEF/WebView2** | 9/10 | Yes (native) | Yes | Very High |
| 5 | **Overlay approach (electron-overlay-window)** | 5/10 | Yes (native) | Yes | Low |

### Recommended Path
**DWM Thumbnail + Input Forwarding** is the best balance of visual fidelity, performance, universality, and implementation complexity. It provides zero-copy GPU-composited live rendering at display refresh rate, works with all GPU-accelerated windows, and can be made interactive via coordinate-translated input forwarding. Implementable via `koffi` (no C++ compilation needed).

**Fallback:** For simple Win32 apps (Notepad, CMD), `SetParent` with the Streamlabs `WS_CLIPSIBLINGS`/`WS_CLIPCHILDREN` hack provides true native embedding with real input handling.

---

## 2. Approach 1: DWM Thumbnails

### How It Works

The Desktop Window Manager (DWM) maintains off-screen DirectX surfaces for every window. The DWM Thumbnail API creates a compositor-level relationship between two windows, causing DWM to render a live, scaled copy of the source window's surface into a destination rectangle on another window. **No pixel data is copied** — it's a GPU texture reference within the compositor's scene graph.

### Core API (`dwmapi.dll`)

```cpp
// Create the thumbnail relationship
HRESULT DwmRegisterThumbnail(
    HWND hwndDestination,     // Your Electron window's HWND
    HWND hwndSource,          // The external window to embed
    PHTHUMBNAIL phThumbnailId // Output: opaque handle
);

// Configure rendering
HRESULT DwmUpdateThumbnailProperties(
    HTHUMBNAIL hThumbnailId,
    const DWM_THUMBNAIL_PROPERTIES *ptnProperties
);

// Query source window dimensions
HRESULT DwmQueryThumbnailSourceSize(
    HTHUMBNAIL hThumbnail,
    PSIZE pSize
);

// Clean up
HRESULT DwmUnregisterThumbnail(HTHUMBNAIL hThumbnailId);
```

### DWM_THUMBNAIL_PROPERTIES Structure

```cpp
typedef struct _DWM_THUMBNAIL_PROPERTIES {
    DWORD dwFlags;                // Bitmask: DWM_TNP_RECTDESTINATION | DWM_TNP_VISIBLE | etc.
    RECT  rcDestination;          // Where to draw in destination window (client coords)
    RECT  rcSource;               // Which region of source to capture
    BYTE  opacity;                // 0-255 (default 255)
    BOOL  fVisible;               // TRUE to show (default FALSE)
    BOOL  fSourceClientAreaOnly;  // TRUE = client area only, no title bar
} DWM_THUMBNAIL_PROPERTIES;
```

### Workflow

1. `DwmRegisterThumbnail(electronHwnd, sourceHwnd, &handle)` — creates relationship
2. `DwmQueryThumbnailSourceSize(handle, &size)` — learn source dimensions
3. Fill `DWM_THUMBNAIL_PROPERTIES`, set `fVisible = TRUE`, set `rcDestination` to desired canvas position
4. `DwmUpdateThumbnailProperties(handle, &props)` — DWM begins rendering
5. Call `DwmUpdateThumbnailProperties` again to reposition/resize (e.g., when canvas scrolls)
6. `DwmUnregisterThumbnail(handle)` — clean up

### Calling from Node.js via Koffi

```javascript
const koffi = require('koffi');
const dwmapi = koffi.load('dwmapi.dll');

const RECT = koffi.struct('RECT', {
    left: 'int32', top: 'int32', right: 'int32', bottom: 'int32'
});

const SIZE = koffi.struct('SIZE', { cx: 'int32', cy: 'int32' });

const DWM_THUMBNAIL_PROPERTIES = koffi.struct('DWM_THUMBNAIL_PROPERTIES', {
    dwFlags: 'uint32',
    rcDestination: RECT,
    rcSource: RECT,
    opacity: 'uint8',
    fVisible: 'int32',
    fSourceClientAreaOnly: 'int32'
});

const DwmRegisterThumbnail = dwmapi.func(
    '__stdcall', 'DwmRegisterThumbnail', 'long', ['void*', 'void*', 'void**']
);
const DwmUpdateThumbnailProperties = dwmapi.func(
    '__stdcall', 'DwmUpdateThumbnailProperties', 'long', ['void*', 'DWM_THUMBNAIL_PROPERTIES*']
);
const DwmUnregisterThumbnail = dwmapi.func(
    '__stdcall', 'DwmUnregisterThumbnail', 'long', ['void*']
);
const DwmQueryThumbnailSourceSize = dwmapi.func(
    '__stdcall', 'DwmQueryThumbnailSourceSize', 'long', ['void*', 'SIZE*']
);

// Usage with Electron:
// const hwndBuffer = mainWindow.getNativeWindowHandle();
// Parse buffer as HWND pointer for koffi
```

### Pros
- **Near-zero CPU usage** — compositor-native GPU texture sharing
- **Works with ALL windows** — DirectX, OpenGL, Vulkan, GDI, UWP
- **Live at display refresh rate** — 60Hz, 144Hz, etc.
- **Source can be occluded** — works even when source window is behind other windows
- **Region clipping** — can show only a sub-region via `rcSource`
- **Arbitrary positioning** — `rcDestination` places it anywhere in your window
- **Scaling handled by GPU** — DWM scales smoothly to any destination size
- **Simplest implementation** — 4 API calls, no frame loop needed

### Cons
- **View-only** — no built-in interactivity; must implement input forwarding separately
- **Renders as TOP layer** — DWM draws the thumbnail ABOVE all your window's web content (HTML/CSS). You CANNOT overlay UI elements on top of it using standard Electron rendering. Workaround: use a separate transparent layered window positioned on top.
- **Top-level HWNDs only** — both source and destination must be top-level windows (not child windows). Cannot target a `<canvas>` element.
- **Minimized windows show stale content** — last frame before minimization
- **No pixel access** — cannot read the thumbnail's pixel data programmatically
- **No 3D transforms** — public API is 2D only (private undocumented APIs support 3D via `IDCompositionVisual`)

### Key Limitation for Electron: Z-Order

The thumbnail is composited as the topmost layer on the destination window. Your React UI renders BEHIND it. Solutions:

1. **Transparent overlay window**: Create a second frameless, transparent Electron `BrowserWindow` positioned exactly on top of the main window, with `setIgnoreMouseEvents(true, { forward: true })`. Render UI controls (panel borders, resize handles, close buttons) on this overlay.

2. **Reserve opaque regions**: Design the canvas so that UI chrome is in regions NOT overlapping with DWM thumbnails. Thumbnails go in the "content area" of each panel, while borders/headers are in separate non-overlapping regions.

### Existing Implementations
- **OnTopReplica** (C#, open-source): [github.com/LorenzCK/OnTopReplica](https://github.com/LorenzCK/OnTopReplica) — the most complete implementation. Includes click forwarding, opacity, region clipping. WinForms/.NET.
- **AutoHotkey LiveThumb class**: DWM thumbnails via `DllCall("dwmapi\DwmRegisterThumbnail")`
- **No existing npm package** wraps `DwmRegisterThumbnail` for live compositor-level thumbnails. `dwm-windows` npm package captures screenshots (bitmaps), not live compositor thumbnails.

### Feasibility Rating: 8/10

Highest-fidelity, lowest-overhead approach. The main challenges are (a) the Z-order issue requiring an overlay window for UI chrome, and (b) implementing input forwarding for interactivity.

---

## 3. Approach 2: Windows.Graphics.Capture (WinRT)

### How It Works

The Windows.Graphics.Capture API provides a GPU-accelerated frame capture pipeline. Each captured frame is a `ID3D11Texture2D` GPU texture — there's no CPU-side pixel copying in the capture path itself.

### Core Pipeline

```
GraphicsCaptureItem (target window)
    → Direct3D11CaptureFramePool (GPU frame buffers)
        → GraphicsCaptureSession (start/stop)
            → FrameArrived event (each frame: ID3D11Texture2D + metadata)
```

### Version Requirements

| Feature | Min Windows Version | Build |
|---------|-------------------|-------|
| Core API (Picker UI) | Windows 10 1803 | 17134 |
| Programmatic capture (no picker) | Windows 10 1903 | 18362 |
| Borderless capture (`IsBorderRequired`) | Windows 10 2104 | 20348 |
| `CreateFreeThreaded` frame pool | Windows 10 1903 | 18362 |

### GPU-Accelerated Window Capture

**Yes, captures all GPU-rendered content:**
- DirectX 9/10/11/12 — captured successfully
- OpenGL — captured via DWM composition
- Vulkan — captured in windowed mode
- **Exception:** True exclusive fullscreen bypasses DWM → black frames (rare; most modern games use borderless fullscreen)

### Performance

| Metric | Value |
|--------|-------|
| FPS | Matches display refresh rate (60Hz, 144Hz) |
| Latency | 1-2 frames (~16-33ms at 60Hz) |
| CPU usage | Minimal (GPU-side texture sharing) |
| GPU overhead | Small blit per frame |

### Yellow Capture Border

- **Windows 10 (before build 20348):** Mandatory yellow border around captured window. No supported workaround.
- **Windows 11 / build 20348+:** Set `session.IsBorderRequired = false` after calling `GraphicsCaptureAccess.RequestAccessAsync(GraphicsCaptureAccessKind.Borderless)`.

### Getting Frames into Electron

This is the main challenge. Options:

**Option A: CPU path (native addon → Buffer → canvas)**
1. C++ native addon creates WGC session, captures `ID3D11Texture2D` frames
2. Copy to staging texture (`D3D11_USAGE_STAGING`) → `Map()` to CPU memory
3. Send BGRA pixel buffer to renderer via IPC
4. Renderer uploads to canvas via `texImage2D()` or `putImageData()`
5. **Downside:** At 1080p 60fps = ~500MB/s bandwidth through GPU→CPU copy

**Option B: Zero-copy GPU path (ANGLE texture import)**
1. Capture produces `ID3D11Texture2D` with shared DXGI handle
2. Electron's WebGL runs on ANGLE (D3D11 backend)
3. Import shared texture via `EGL_ANGLE_d3d_texture_client_buffer` extension
4. Render as WebGL texture — zero CPU copies
5. **Highest performance** but requires deep ANGLE integration

**Option C: Video encoding path**
1. Encode captured frames via Media Foundation (H.264 hardware encoding)
2. Pipe as `MediaStream` to renderer → `<video>` element
3. **Downside:** 50-100ms+ encoding/decoding latency

### How OBS Uses It

OBS's `libobs-winrt/winrt-capture.cpp`:
- Creates capture via `IGraphicsCaptureItemInterop::CreateForWindow(hwnd)`
- Frame pool: `Direct3D11CaptureFramePool::Create(device, B8G8R8A8_UNORM, 2, size)`
- On `FrameArrived`: extracts `ID3D11Texture2D`, copies via `CopyResource()`/`CopySubresourceRegion()`
- Disables border: `session.IsBorderRequired(false)` when supported

### Existing npm Packages

| Package | Status | Notes |
|---------|--------|-------|
| `@nodert-win10-21h1/windows.graphics.capture` | v0.1.6, ~3 years old | Auto-generated WinRT bindings; D3D texture interop is very difficult from JS |
| `node-screenshots` (uses XCap Rust lib) | Active | Screenshots only, no streaming. XCap supports WGC via `wgc` feature flag |
| `windows-capture` (Rust crate) | Active | Rust only, not on npm. "Fastest Windows Screen Capture Library" |

**No existing npm package provides real-time WGC frame streaming for Electron.**

### Pros
- Captures all GPU-accelerated windows
- High frame rate at display refresh
- Low latency (GPU textures)
- Can capture sub-regions
- Borderless on Windows 11+
- Can process/transform frames before display

### Cons
- **View-only** — no input forwarding built in
- **Complex Electron integration** — requires native C++ addon for D3D11 interop
- **CPU copy overhead** — unless using ANGLE texture import (complex)
- **Yellow border on Windows 10** (pre-build 20348)
- **Minimized windows** — stops producing frames
- **Higher complexity** than DWM thumbnails for same visual result

### Feasibility Rating: 7/10

More flexible than DWM thumbnails (can manipulate frames) but significantly more complex to integrate with Electron. Best when you need frame processing (effects, encoding, transformation). For simple live preview, DWM thumbnails are superior.

---

## 4. Approach 3: High-Refresh PrintWindow + Input Forwarding

### PrintWindow with PW_RENDERFULLCONTENT

The `PW_RENDERFULLCONTENT` flag (Windows 8.1+) enables `PrintWindow` to capture DirectComposition and GPU-rendered content by going through DWM rather than sending `WM_PAINT`.

### Performance

| Method | GPU Content? | Max FPS | CPU Usage | Notes |
|--------|-------------|---------|-----------|-------|
| BitBlt | No (black frames) | ~30 | High | Legacy, fast but blind to GPU |
| PrintWindow (default) | No | ~5 | Very high | Sends WM_PAINT, extremely slow |
| PrintWindow + PW_RENDERFULLCONTENT | **Yes** | ~10-15 | Very high | Captures GPU content but slow |

### Can It Be Made Interactive?

Yes, by forwarding input events. The captured bitmap is displayed in a `<canvas>` or `<img>` element. Mouse clicks on that element are translated to the source window's coordinate space and forwarded via `PostMessage`/`SendMessage`.

### Input Forwarding Mechanisms

**PostMessage/SendMessage (window-targeted):**
```cpp
// Mouse: lParam = MAKELPARAM(x, y), wParam = modifier flags
PostMessage(targetHwnd, WM_LBUTTONDOWN, MK_LBUTTON, MAKELPARAM(x, y));
PostMessage(targetHwnd, WM_LBUTTONUP, 0, MAKELPARAM(x, y));

// Keyboard: wParam = virtual key code, lParam = scan code + flags
PostMessage(targetHwnd, WM_KEYDOWN, VK_RETURN, 0x001C0001);
PostMessage(targetHwnd, WM_KEYUP, VK_RETURN, 0xC01C0001);
```

**Limitations of PostMessage for input:**
- Raymond Chen (Microsoft): "You can't simulate keyboard input with PostMessage" — many apps check `GetAsyncKeyState()` and ignore synthesized messages
- Mouse messages work more reliably than keyboard
- Must target the correct child HWND, not just the top-level window
- UWP/WPF apps using pointer input may ignore posted WM_MOUSE* messages

**SendInput (global, hardware-level):**
```cpp
INPUT input = {};
input.type = INPUT_MOUSE;
input.mi.dx = absoluteX;  // 0-65535 normalized
input.mi.dy = absoluteY;
input.mi.dwFlags = MOUSEEVENTF_ABSOLUTE | MOUSEEVENTF_LEFTDOWN;
SendInput(1, &input, sizeof(INPUT));
```

- Injects into global input stream — goes to **foreground window only**
- Target window must have focus
- Moves the real cursor (visible side effect)
- Blocked by UIPI for elevated windows
- Cannot target background/hidden windows

### Coordinate Translation Pipeline

1. User clicks at (canvasX, canvasY) within the `<canvas>` element
2. Map to source window coordinates: `sourceX = canvasX * (sourceWidth / displayWidth)`, `sourceY = canvasY * (sourceHeight / displayHeight)`
3. Account for DPI: use `LogicalToPhysicalPointForPerMonitorDPI` if DPI awareness differs
4. Pack: `lParam = MAKELPARAM(sourceX, sourceY)`
5. Forward: `PostMessage(targetHwnd, WM_LBUTTONDOWN, wParam, lParam)`

### Does Input Work on Hidden/Offscreen Windows?

| Window State | PostMessage | SendInput |
|-------------|-------------|-----------|
| Visible | Yes | Yes (needs focus) |
| Offscreen (positioned beyond screen) | Yes | No |
| Hidden (SW_HIDE) | Partially (app-dependent) | No |
| Minimized | Partially (app-dependent) | No |

### UAC / UIPI Restrictions

- Standard (medium integrity) apps **cannot** send input to elevated (high integrity) windows
- Both SendMessage/PostMessage AND SendInput are blocked
- Failures are **silent** — no error returned
- Workaround: Run Electron elevated (not recommended) or use `UIAccess` manifest flag (requires code signing + installation in Program Files)

### Pros
- Universal: works with any window
- Interactive when combined with input forwarding
- Simple conceptually

### Cons
- **Extremely slow** — 10-15 FPS max with PW_RENDERFULLCONTENT
- **High CPU usage** — synchronous bitmap copy
- **Noticeable latency** — capture + display + input round-trip = 30-100ms
- **Flickering** — PrintWindow can cause visual artifacts in the source window
- **Input forwarding is imperfect** — PostMessage doesn't work for all apps; SendInput requires focus
- **DPI handling complexity**
- **Popups/menus** spawn new windows that need separate capture/forwarding

### Feasibility Rating: 4/10

The low frame rate and high CPU usage make this unsuitable for an "embedded window" experience. Only viable as a last-resort fallback for windows that can't be captured by other means.

---

## 5. Approach 4: Native Addons / npm Packages

### FFI Libraries

| Library | Status | Performance | Recommendation |
|---------|--------|-------------|----------------|
| **koffi** | Actively maintained (v2.15.2, 2026) | 26-56x faster than ffi-napi, ~50-80% overhead vs native | **Recommended** |
| **ffi-napi** | Dormant (last release ~5 years ago) | Baseline (slow) | Do not use |
| **node-gyp C++ addon** | N/A (build system) | Best possible | Use only if koffi insufficient |
| **Rust + napi-rs** | Actively maintained | Best perf + safety | Good for production, higher dev effort |

### Koffi Performance Benchmarks (Windows x86_64)

| Operation | Koffi | ffi-napi | Native NAPI |
|-----------|-------|----------|-------------|
| `rand()` | 1,352 ns | 35,640 ns | 859 ns |
| `atoi()` | 2,440 ns | 136,890 ns | 1,336 ns |
| Raylib frame | 29.8 us | 96.3 us | 27.3 us |

### Relevant npm Packages

| Package | What It Does | Status | Useful? |
|---------|-------------|--------|---------|
| **koffi** | Call any DLL function from Node.js | Active (v2.15.2) | **Essential** — call Win32 APIs directly |
| **libwin32** | Higher-level Win32 bindings via koffi | Active (v0.11.1, 2026) | Useful for user32/kernel32 |
| **get-windows** | Get active/open window metadata (title, bounds, pid) | Active (v9.2.3) | **Yes** — window discovery |
| **@nut-tree/nut-js** | Cross-platform desktop automation (mouse, keyboard, screen) | Active (v4.2.0) | Yes — input simulation |
| **@hurdlegroup/robotjs** | Desktop automation (mouse, keyboard, screen) | Active fork of robotjs | Alternative to nut-js |
| **electron-overlay-window** | Overlay Electron window tracking a target window | Active | **Yes** — for overlay approach |
| **node-window-manager** | Window enumeration and manipulation | Last updated 2020 | Outdated |
| **robotjs** | Original desktop automation | **Unmaintained** | Use fork instead |
| **win-control** | Basic window manipulation (find, focus, bounds) | Lightly maintained | Limited utility |
| **windows-window-controller** | ShowWindow wrapper | Inactive | Not useful |
| **active-win** | Get active window info | Superseded by get-windows | Use get-windows |
| **electron-window-embed** | Does not exist | N/A | N/A |
| **node-window-rendering** | Does not exist | N/A | N/A |
| **desktop-window-manager** | Does not exist as npm package | N/A | N/A |
| **dwm-windows** | Window enumeration + PNG screenshots | Active | Captures screenshots, NOT live thumbnails |

### Rust-Based Solutions

**napi-rs** ([napi.rs](https://napi.rs/)) enables building Node.js addons in Rust:
- No node-gyp needed
- Produces `.node` DLLs
- Works with Electron

**Relevant Rust crates:**
- **windows** (by Microsoft): Official crate exposing ALL Windows APIs including `DwmRegisterThumbnail`, `SetParent`, `SendInput`
- **windows-capture**: Direct WGC wrapper, "Fastest Windows Screen Capture Library"
- **scap** (by CapSoftware): Cross-platform capture using WGC on Windows
- **wgc** (by Atliac): Ergonomic WGC wrapper

**Architecture:** Build a Rust native addon via napi-rs + `windows` crate that exposes DWM thumbnail registration, input forwarding, and window management to JavaScript. Maximum performance and type safety.

### Key GitHub Repos

- **electron/electron#10547** — "Embed External Native Windows" — canonical discussion (2017, still open). Documents the Streamlabs `WS_CLIPSIBLINGS`/`WS_CLIPCHILDREN` hack.
- **OnTopReplica** — C# DWM thumbnail implementation with click forwarding
- **Win32CaptureSample** (by robmikh) — Reference WGC implementation
- **OBS Studio** — `libobs-winrt/winrt-capture.cpp` for WGC patterns

### Feasibility Rating: 8/10

The tooling exists. Koffi makes calling Win32 APIs from Node.js straightforward without any C++ compilation. For higher performance or complex D3D11 interop, a Rust napi-rs addon is the best path.

---

## 6. Approach 5: Electron-Specific APIs

### desktopCapturer

```javascript
const sources = await desktopCapturer.getSources({ types: ['window'] });
const target = sources.find(s => s.name === 'Chrome');

const stream = await navigator.mediaDevices.getUserMedia({
    video: {
        mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: target.id,
            maxFrameRate: 30
        }
    }
});

// Display in video element
videoElement.srcObject = stream;
```

**Pros:** Built into Electron, no native addon needed, produces a `MediaStream`.  
**Cons:** CPU-intensive (bitmap capture under the hood), 50-150ms latency, ~30 FPS max, no interaction forwarding, captures at the Chromium level (not as efficient as native APIs).

### BrowserView / WebContentsView

**Cannot embed external native windows.** Only displays web content (HTML/URLs). `WebContentsView` (replacement for deprecated `BrowserView`) is bound to Chromium's rendering pipeline.

### BrowserWindow Options for Overlay

- `transparent: true` + `frame: false` — frameless transparent window
- `setIgnoreMouseEvents(true, { forward: true })` — click-through with hover detection
- `alwaysOnTop: true` — keeps above other windows

**Useful for:** Creating the UI overlay on top of DWM thumbnails.

### getNativeWindowHandle()

`mainWindow.getNativeWindowHandle()` returns a `Buffer` containing the HWND. Essential for all Win32 API approaches.

### Offscreen Rendering

Two modes:
- `useSharedTexture: true` — frames stay in GPU memory (for rendering Electron content OUT, not for capturing external content IN)
- CPU bitmap mode — `paint` event delivers `NativeImage` at up to 240 FPS

**Not directly applicable** for embedding external windows, but demonstrates Electron's shared-texture infrastructure.

### electron-overlay-window (npm)

Most mature community solution for "fake embedding":
- Creates an overlay Electron window that tracks a target window's position/size
- Uses native platform APIs for window tracking
- Written in C/ObjC++/TypeScript

### setParentWindow / setContentView

Both only work with Electron windows/views. Cannot accept external HWNDs. **Not useful.**

### IPC Performance for Frame Streaming

- IPC uses Chromium's named pipes — fast but involves serialization
- `Buffer` objects are **copied, not shared** across IPC
- Sending 1920x1080x4 bytes (8MB) at 60fps = extreme GC pressure
- `SharedArrayBuffer` requires cross-origin isolation
- **Best approach:** Native addon writes to shared memory; renderer reads directly

### Feasibility Rating: 5/10

Electron's built-in APIs are insufficient for high-quality window embedding. `desktopCapturer` works but is slow and non-interactive. The real power comes from native addons calling Win32 APIs, with Electron providing the UI shell.

---

## 7. Approach 6: How Other Apps Do It

### Groupy (Stardock) — Window Tabbing

- **Does NOT reparent windows** via SetParent. Stardock explicitly stated "changing owner of a window is not a good solution."
- Injects/overlays a tab strip onto the window frame (title bar area)
- When switching tabs: hides inactive windows, repositions active one to same screen area
- Windows remain independent top-level windows
- Struggles with custom title bar apps (Steam, Battle.net) — confirming it hooks into standard Win32 non-client area

### FancyZones (PowerToys) — Window Layouts

- Purely a window position/size manager — does NOT embed windows
- Uses standard `SetWindowPos` to snap windows to predefined zones
- Creates a transparent overlay during drag to show zone boundaries
- Under 50MB RAM, negligible CPU

### AquaSnap — Window Snapping

- Same category as FancyZones — positioning only, no embedding
- "Magnetic" snapping system using standard Win32 positioning APIs
- 100% native code, no .NET

### OBS Studio — Window Capture

OBS uses **three different capture methods**:

| Method | API | GPU Content? | Performance | Notes |
|--------|-----|-------------|-------------|-------|
| BitBlt | GDI | No | Fast but blind | Legacy fallback |
| Windows Graphics Capture | WinRT | **Yes** | Best | Requires Win10 1903+ |
| Game Capture | DLL injection + API hooking | **Yes** | Lowest latency | Hooks Present() calls |

**Game Capture details:** Injects `graphics-hook.dll` into target process, hooks `IDXGISwapChain::Present` (D3D), `wglSwapBuffers` (OpenGL), `vkQueuePresentKHR` (Vulkan). Copies frame data to shared memory via IPC. Highest performance but requires DLL injection.

### OnTopReplica — Live Window Clone (Open Source)

**Most relevant reference implementation.** GitHub: [LorenzCK/OnTopReplica](https://github.com/LorenzCK/OnTopReplica)

- Uses `DwmRegisterThumbnail` for live, zero-copy window rendering
- Always-on-top window showing real-time clone of any window
- Supports **region selection** — clip to a sub-region of the source
- Supports **click forwarding** — translates clicks to source window coordinates
- Written in C# / WinForms / .NET 4.0
- **This is essentially what TerminalDeck needs, implemented in .NET**

### Windows Alt+Tab / Task View

- Uses DWM Thumbnail API internally for live window previews
- Shell calls `DwmRegisterThumbnail` with popup as destination, app window as source
- These are live compositor renders, NOT screenshots
- Task View uses undocumented private APIs (`DwmpCreateSharedThumbnailVisual`) for smooth 3D animations

### DisplayFusion — Multi-Monitor Management

- Does NOT embed windows — manages positioning across monitors
- Injects per-process hooks for window resize messages
- Adds custom titlebar buttons via injection
- C# scripting API for automation

---

## 8. Approach 7: DirectComposition

### IDCompositionDevice / IDCompositionVisual

DirectComposition is a GPU-accelerated compositor API. It organizes content in a hierarchical visual tree.

### Can It Composite External Windows?

**Documented API — limited:**
- `CreateSurfaceFromHwnd(hwnd)` — only works with **layered windows** (`WS_EX_LAYERED`) owned by the calling process
- Cross-process composition is explicitly blocked with `DCOMPOSITION_ERROR_ACCESS_DENIED`

**Undocumented private APIs — powerful but risky:**
- `DwmpCreateSharedThumbnailVisual` (ordinal 147 in dwmapi.dll) — creates an `IDCompositionVisual` from ANY top-level window
- Returns a visual that can be placed in a DirectComposition tree
- Allows applying effects (blur, saturation, transforms, animations)
- Used internally by Windows shell for Alt-Tab, Task View
- **Symbols are stripped; API can change between Windows updates**

### DXGI Desktop Duplication

- Captures **entire desktop per monitor**, NOT specific windows
- Available since Windows 8 via `IDXGIOutputDuplication`
- ~3x faster than BitBlt
- To capture a specific window: crop the full desktop capture to the window's screen rectangle
- Cannot capture exclusive fullscreen apps

### Relationship to DWM Thumbnails

| Feature | Public DWM Thumbnail API | Private DWM + DirectComposition |
|---------|-------------------------|--------------------------------|
| Window targeting | Any window | Any window |
| Transforms | 2D position/scale only | Full 3D transforms, animations |
| Effects | Opacity only | Blur, saturation, color matrix |
| API stability | Stable, documented | Undocumented, can break |
| Ease of use | 4 functions | Complex COM/DirectX setup |

### Feasibility Rating: 5/10

DirectComposition's documented APIs cannot composite external process windows. The undocumented APIs are powerful (Windows shell uses them) but fragile and can break between OS updates. Not recommended for a shipping product unless you're willing to maintain compatibility patches.

---

## 9. Recommended Implementation Plan

### Phase 1: DWM Thumbnail Live View (MVP)

**Goal:** Display any external window live inside the Electron canvas, view-only.

1. **Install koffi**: `npm install koffi`
2. **Create `dwm-thumbnail.ts` service** in main process:
   - Load `dwmapi.dll` via koffi
   - Define `DWM_THUMBNAIL_PROPERTIES` struct
   - Implement `registerThumbnail(electronHwnd, sourceHwnd)` → handle
   - Implement `updateThumbnail(handle, x, y, width, height)` → positions thumbnail
   - Implement `unregisterThumbnail(handle)` → cleanup
3. **Create `window-finder.ts` service** in main process:
   - Use `get-windows` npm package for window enumeration
   - Or use koffi to call `EnumWindows` + `GetWindowTextW` from user32.dll
   - Build a window picker UI
4. **Wire up IPC**:
   - Renderer sends "embed this window at these coordinates" via `ipcRenderer.invoke`
   - Main process calls `DwmRegisterThumbnail` + `DwmUpdateThumbnailProperties`
   - On canvas scroll/resize, renderer sends updated coordinates, main process calls `DwmUpdateThumbnailProperties`
5. **Handle the Z-order issue**:
   - Create a secondary transparent `BrowserWindow` as an overlay for UI chrome
   - Render panel borders, headers, resize handles, close buttons on the overlay
   - Keep overlay synced with main window position/size

### Phase 2: Input Forwarding (Interactivity)

**Goal:** Users can click, type, and interact with embedded windows.

1. **Add input capture in renderer**:
   - Attach mouse/keyboard event listeners to the panel area
   - On mouse events: calculate relative position within the thumbnail
2. **Add coordinate translation in main process**:
   - Scale from thumbnail display size to source window actual size
   - Handle DPI differences with `LogicalToPhysicalPointForPerMonitorDPI`
3. **Implement forwarding**:
   - Primary: `PostMessage(targetHwnd, WM_LBUTTONDOWN/UP/MOVE, wParam, MAKELPARAM(x, y))`
   - For keyboard: `PostMessage(targetHwnd, WM_KEYDOWN/UP, vkCode, scanInfo)`
   - Fallback: `SendInput` for apps that ignore PostMessage (requires focusing the target window briefly)
4. **Handle edge cases**:
   - Popup/menu detection: monitor for new windows spawned by the target
   - Focus management: use `AttachThreadInput` to share input queues
   - Drag operations: detect WM_NCLBUTTONDOWN and switch to SendInput mode

### Phase 3: SetParent Fallback for Compatible Windows

**Goal:** True native embedding for simple Win32 apps where it works better.

1. **Detect compatible windows**:
   - Try `SetParent` — if the window renders correctly after a brief delay, keep it
   - If blank/grey, fall back to DWM thumbnail approach
2. **Implement Streamlabs hack**:
   - Find Chromium's "Intermediate D3D Window" child HWND
   - Apply `WS_CLIPSIBLINGS` to it
   - Apply `WS_CLIPCHILDREN` to the Electron BrowserWindow
   - Call `SetParent(externalHwnd, electronHwnd)`
3. **Handle cleanup**: Restore original parent on panel close

### Phase 4: Polish

1. **Thumbnail lifecycle management**: Handle source window destruction, minimization
2. **Smooth repositioning**: Debounce `DwmUpdateThumbnailProperties` calls during canvas pan/zoom
3. **Window drag-to-embed**: Detect drag gesture, enumerate windows under cursor, register thumbnail on drop
4. **Performance monitoring**: Track DWM compositor overhead

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│ Electron Main Process                                    │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │ dwm-thumb.ts │  │ input-fwd.ts │  │ window-mgr.ts │ │
│  │ (koffi →     │  │ (koffi →     │  │ (koffi →      │ │
│  │  dwmapi.dll) │  │  user32.dll) │  │  user32.dll)  │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬────────┘ │
│         │                  │                  │          │
│         └──────── IPC ─────┴──────── IPC ─────┘          │
│                     │                                    │
├─────────────────────┼────────────────────────────────────┤
│ Electron Renderer   │                                    │
│                     ▼                                    │
│  ┌──────────────────────────────────────────────┐       │
│  │ React Canvas                                  │       │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐     │       │
│  │  │ Panel 1  │ │ Panel 2  │ │ Panel 3  │     │       │
│  │  │(DWM Thumb│ │(SetParent│ │(DWM Thumb│     │       │
│  │  │ +fwd)    │ │ native)  │ │ +fwd)    │     │       │
│  │  └──────────┘ └──────────┘ └──────────┘     │       │
│  └──────────────────────────────────────────────┘       │
│                                                          │
│  ┌──────────────────────────────────────────────┐       │
│  │ Transparent Overlay (UI chrome on top of      │       │
│  │ DWM thumbnails: borders, headers, controls)   │       │
│  └──────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

### Alternative: Native Host + WebView2

If the overlay window approach for handling DWM thumbnail Z-ordering proves too fragile, consider:

1. Build the host application in **C++ (Win32)**, **C# (WPF with HwndHost)**, or **Qt** (`QWindow::fromWinId` + `QWidget::createWindowContainer`)
2. Embed **WebView2** (or CEF) for the React UI portions
3. Use the native framework's window embedding capabilities for external windows
4. This is the approach Streamlabs Desktop uses ("gross but it works")

**Pros:** First-class native window embedding, no Z-order hacks, proper focus management  
**Cons:** Major architecture change, lose Electron's ecosystem/tooling

---

## 10. References

### Microsoft Documentation
- [DWM Thumbnail Overview](https://learn.microsoft.com/en-us/windows/win32/dwm/thumbnail-ovw)
- [DwmRegisterThumbnail](https://learn.microsoft.com/en-us/windows/win32/api/dwmapi/nf-dwmapi-dwmregisterthumbnail)
- [DwmUpdateThumbnailProperties](https://learn.microsoft.com/en-us/windows/win32/api/dwmapi/nf-dwmapi-dwmupdatethumbnailproperties)
- [DWM_THUMBNAIL_PROPERTIES](https://learn.microsoft.com/en-us/windows/win32/api/dwmapi/ns-dwmapi-dwm_thumbnail_properties)
- [Screen Capture (Windows.Graphics.Capture)](https://learn.microsoft.com/en-us/windows/uwp/audio-video-camera/screen-capture)
- [GraphicsCaptureSession.IsBorderRequired](https://learn.microsoft.com/en-us/uwp/api/windows.graphics.capture.graphicscapturesession.isborderrequired)
- [IGraphicsCaptureItemInterop::CreateForWindow](https://learn.microsoft.com/en-us/windows/win32/api/windows.graphics.capture.interop/nf-windows-graphics-capture-interop-igraphicscaptureiteminterop-createforwindow)
- [SendInput function](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-sendinput)
- [DirectComposition Portal](https://learn.microsoft.com/en-us/windows/win32/directcomp/directcomposition-portal)
- [IDCompositionVisual::SetContent](https://learn.microsoft.com/en-us/windows/win32/api/dcomp/nf-dcomp-idcompositionvisual-setcontent)
- [Desktop Duplication API](https://learn.microsoft.com/en-us/windows/win32/direct3ddxgi/desktop-dup-api)
- [High DPI Desktop Development](https://learn.microsoft.com/en-us/windows/win32/hidpi/high-dpi-desktop-application-development-on-windows)
- [WPF HwndHost](https://learn.microsoft.com/en-us/dotnet/desktop/wpf/advanced/hosting-win32-content-in-wpf)
- [Surface Sharing Between Graphics APIs](https://learn.microsoft.com/en-us/windows/win32/direct3darticles/surface-sharing-between-windows-graphics-apis)

### Blog Posts & Articles
- [DWM Thumbnails with IDCompositionVisual (ADeltaX)](https://blog.adeltax.com/dwm-thumbnails-but-with-idcompositionvisual/)
- [Fancy Windows Previewer (Victor Hurdugaci)](https://www.victorhurdugaci.com/fancy-windows-previewer/)
- [How Can I Display a Live Screenshot of Another App? (Raymond Chen / The Old New Thing)](https://devblogs.microsoft.com/oldnewthing/20130513-00/?p=4393)
- [You Can't Simulate Keyboard Input with PostMessage (Raymond Chen)](https://devblogs.microsoft.com/oldnewthing/20250319-00/?p=110979)
- [New Ways to Do Screen Capture (Windows Developer Blog)](https://blogs.windows.com/windowsdeveloper/2019/09/16/new-ways-to-do-screen-capture/)
- [Desktop Compositing Latency Analysis (lofibucket)](https://www.lofibucket.com/articles/dwm_latency.html)
- [Game Capture & Window Capture Methods (ryanai.dev)](https://ryanai.dev/en/blog/pc-window-capture)

### GitHub Repositories
- [OnTopReplica](https://github.com/LorenzCK/OnTopReplica) — C# DWM thumbnail with click forwarding (reference implementation)
- [Win32CaptureSample](https://github.com/robmikh/Win32CaptureSample) — WGC reference by Microsoft's robmikh
- [OBS Studio (winrt-capture.cpp)](https://github.com/obsproject/obs-studio/blob/master/libobs-winrt/winrt-capture.cpp) — Production WGC usage
- [Electron Issue #10547](https://github.com/electron/electron/issues/10547) — Canonical "Embed External Native Windows" discussion
- [electron-overlay-window](https://github.com/SnosMe/electron-overlay-window) — Overlay window tracking
- [dwm-windows](https://github.com/giacomo/dwm-windows) — Node.js DWM window enumeration
- [libwin32](https://github.com/Septh/libwin32) — Win32 bindings via koffi
- [vladris/DWM Thumbnail.cs](https://github.com/vladris/DWM/blob/master/src/Thumbnail.cs) — Clean C# DWM wrapper
- [windows-capture (Rust)](https://github.com/NiiightmareXD/windows-capture) — Fast WGC wrapper
- [scap (Rust)](https://github.com/CapSoftware/scap) — Cross-platform capture
- [Streamlabs Desktop](https://github.com/streamlabs/desktop) — Production Electron + SetParent usage
- [napi-rs](https://github.com/napi-rs/napi-rs) — Rust native addon framework
- [windows-rs](https://github.com/microsoft/windows-rs) — Official Microsoft Rust Windows API crate

### npm Packages
- [koffi](https://www.npmjs.com/package/koffi) — FFI for Node.js (recommended)
- [get-windows](https://www.npmjs.com/package/get-windows) — Window enumeration
- [@nut-tree/nut-js](https://www.npmjs.com/package/@nut-tree/nut-js) — Desktop automation
- [electron-overlay-window](https://www.npmjs.com/package/electron-overlay-window) — Overlay tracking
- [@hurdlegroup/robotjs](https://www.npmjs.com/package/@hurdlegroup/robotjs) — Desktop automation fork
- [node-screenshots](https://www.npmjs.com/package/node-screenshots) — Screenshot capture via XCap/WGC
