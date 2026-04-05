# Focus Mode

Focus mode zooms in on a single panel, dimming all others. Implemented in `src/renderer/hooks/useFocusMode.ts` and `src/renderer/components/FocusMode/FocusOverlay.tsx`.

## Entry/Exit

- **Focus mode hotkey** (default F11, configurable via Settings -> General -> Keyboard Shortcuts) -- Toggle focus mode on the currently focused instance (via `useKeyboardShortcuts`, reads `settings.focusModeHotkey`)
- **Escape** -- Exit focus mode (captured in capture phase by `useFocusMode`)
- **Click overlay** -- Exit focus mode (via `FocusOverlay.onClick`)
- **Command palette** -- "Toggle Focus Mode" action dispatches a synthetic keydown event for the configured hotkey

## Entering Focus Mode

`enterFocusMode(instanceId)` in `src/renderer/hooks/useFocusMode.ts`:

1. Save current canvas state (`panX`, `panY`, `zoom`) in `savedStateRef`
2. Calculate viewport dimensions accounting for sidebar and title bar:
   ```
   sidebarWidth = store.sidebarVisible ? 260 : 0
   titleBarHeight = 28
   viewportWidth = window.innerWidth - sidebarWidth
   viewportHeight = window.innerHeight - titleBarHeight
   ```
   Previously used raw `window.innerWidth` / `window.innerHeight`, which caused the focused instance to be shifted right and partially off-screen when the sidebar was visible.
3. Calculate the transform needed to center and zoom the target instance:
   - Zoom: `min(vpWidth * 0.9 / instWidth, vpHeight * 0.9 / instHeight, 2.0)` -- fills 90% of viewport
   - Pan: Computed so the instance center maps to the viewport center
4. Set `focusModeActive = true` and `focusModeAnimating = true`
5. Set `focusedInstanceId` to the target
6. Apply the computed zoom and pan
7. After 450ms, set `focusModeAnimating = false` (disables CSS transition)

## Smooth Animation

When `focusModeAnimating` is true, the canvas inner div gets `transition: transform 400ms ease-out`. This creates a smooth zoom/pan animation when entering or exiting focus mode. The flag is cleared after 450ms (slightly longer than the 400ms transition to ensure it completes).

This is applied in `useCanvas`:
```typescript
const containerStyle = {
  transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
  transition: focusModeAnimating ? 'transform 400ms ease-out' : undefined,
};
```

## Exiting Focus Mode

`exitFocusMode()`:

1. Enable CSS transition (`focusModeAnimating = true`)
2. Restore saved `panX`, `panY`, `zoom`
3. Clear `focusedInstanceId`
4. Set `focusModeActive = false`
5. After 450ms, disable CSS transition

## Visual Effects

### Dim overlay (`FocusOverlay` component)

A fixed full-screen div with:
- `background: rgba(0, 0, 0, 0.6)`
- `z-index: 5000`
- Fade in/out animation (200ms opacity transition)
- Click handler calls `onExit`

The overlay uses a mount/unmount pattern: `mounted` controls DOM presence, `visible` controls opacity. On deactivation, opacity fades to 0 first, then the component unmounts after 200ms.

### Panel dimming (in `CanvasPanel`)

Non-focused panels in focus mode get:
- `opacity: 0.3`
- `pointerEvents: 'none'` (prevents interaction)

The focused panel retains `opacity: 1` and full interactivity. The canvas area also gets elevated z-index (`z-index: 5001`) during focus mode so it renders above the overlay.

## State Preservation

The hook stores the previous canvas state in a React ref (`savedStateRef`). This is not persisted -- if the app is closed during focus mode, the focus mode state is lost (but the app will restart with the focused zoom/pan position).

## useFocusMode Return Value

```typescript
interface FocusModeReturn {
  isFocusMode: boolean;        // Store state
  focusedId: string | null;    // Only set when focus mode is active
  enterFocusMode: (instanceId: string) => void;
  exitFocusMode: () => void;
  toggleFocusMode: (instanceId?: string) => void;
}
```

`toggleFocusMode` accepts an optional instance ID. If not provided, it uses the currently focused instance from the store.
