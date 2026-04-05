# Canvas System

The canvas is an infinite pannable and zoomable surface where terminal panels are arranged. Implemented in `src/renderer/components/Canvas/Canvas.tsx` with interaction logic in `src/renderer/hooks/useCanvas.ts`.

## Coordinate System

The canvas uses two coordinate spaces:

- **Screen space (viewport):** Pixel coordinates relative to the browser window. `(0, 0)` is the top-left of the canvas element.
- **World space (canvas):** Logical coordinates where panels are positioned. Transformed by pan and zoom.

**Conversion formulas** (from `src/renderer/utils/geometry.ts`):

```
World = (Screen - Pan) / Zoom
Screen = World * Zoom + Pan
```

## CSS Transform Approach

The canvas renders as two nested divs:

```html
<div ref={canvasRef} style="overflow: hidden; position: absolute; inset: 0;">
  <!-- Outer: viewport, handles mouse events -->
  <div style="transform: translate(panX, panY) scale(zoom); transform-origin: 0 0; width: 0; height: 0;">
    <!-- Inner: transformed layer, panels are absolutely positioned children -->
    <CanvasPanel style="position: absolute; left: worldX; top: worldY;" />
    <SnapGuides />
  </div>
</div>
```

The inner div has **zero intrinsic size** (`width: 0; height: 0`). Panels use `position: absolute` with `left`/`top` set to world coordinates. The browser's CSS transform handles the mapping to screen coordinates.

## Pan

**Scroll/two-finger swipe:** Normal wheel events (without Ctrl) pan the canvas. `deltaX` pans horizontally, `deltaY` pans vertically. Direction is natural (subtract delta).

**Terminal scroll priority:** When the cursor is inside a terminal panel (detected via `.xterm` / `.xterm-viewport` DOM class), scrolling is handled by xterm's scrollback first. The canvas only pans once the terminal reaches its scroll boundary (top or bottom) and the user scrolls again in the same direction. This two-step boundary detection prevents accidental canvas panning while reading terminal history.

**Left-click drag on canvas background:** Clicking on the canvas element itself (not on a panel) starts a pan drag. The `e.target === e.currentTarget` check ensures only background clicks trigger panning.

**Middle-mouse-button drag:** Button 1 (middle click) starts panning from anywhere, even over panels.

**Implementation:** The `useCanvas` hook (`src/renderer/hooks/useCanvas.ts`) tracks `isPanning` state in a ref to avoid re-renders during drag. Mouse move/up listeners are attached to `window` for reliable tracking even when the cursor leaves the canvas.

## Zoom

**Ctrl+scroll (or Cmd+scroll on macOS):** When `settings.zoomEnabled` is true, Ctrl+wheel zooms toward the cursor position.

**Zoom algorithm:**
1. Compute `zoomFactor = 1 - deltaY * 0.001`
2. New zoom = `clampZoom(currentZoom * zoomFactor)` (clamped to [0.25, 2.0])
3. Get the world coordinate under the cursor at the old zoom
4. Adjust pan so that same world point stays under the cursor at the new zoom:
   ```
   newPanX = cursorScreenX - worldPt.x * newZoom
   newPanY = cursorScreenY - worldPt.y * newZoom
   ```

**Browser zoom prevention:** A passive:false wheel event listener on the canvas element calls `e.preventDefault()` to prevent the browser's default Ctrl+scroll zoom behavior. Normal scroll events inside terminal panels (`.xterm`) are NOT prevented — xterm handles its own scrollback natively.

## Boundary Clamping

Pan is clamped so the user cannot scroll infinitely far from their panels. The clamping logic is in `src/renderer/utils/geometry.ts` (`clampPan` function).

**Rules:**
- **Top/left:** Tight clamping -- the viewport cannot scroll past the outermost instance's top-left corner.
- **Bottom/right:** Loose clamping -- the viewport can scroll `canvasMargin` pixels (default 150px) past the outermost instance's bottom-right corner.

**When content fits in viewport:** If all panels fit within the viewport, the pan is still clamped so the top-left edge doesn't scroll past the content's top-left boundary.

**When no panels exist:** Pan is unclamped (returns the input values unchanged).

## Panel Rendering

The `Canvas` component collects **all** instances from the active workspace (including minimized) and renders each as a `<CanvasPanel>`. Minimized panels are rendered with `display: none` — this preserves the xterm DOM, scrollback buffer, and PTY connection so that restoring a minimized panel is instant with no loss of state.

Instance selection uses `useShallow` from Zustand to prevent unnecessary re-renders when the array reference changes but contents are the same. Panels are memoized with `useMemo` keyed on the joined instance ID string.

**Empty state:** When no instances exist, a centered message is shown: "No terminal instances / Click the + button to create your first terminal".

## Focus Clearing

Clicking on the canvas background (not on a panel) clears `focusedInstanceId` to `null`. This is checked via `e.target === e.currentTarget` in the `handleCanvasMouseDown` callback.
