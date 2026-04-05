# Indicator Lights

Each terminal panel has a small colored circle in its title bar indicating the terminal's activity state. Implemented in `src/renderer/hooks/useIndicatorLight.ts` and rendered by `src/renderer/components/IndicatorLight.tsx`.

## State Machine

```
                   +--- data arrives ---+
                   |                    |
                   v                    |
  [off] ----data----> [blue] <---------+
   ^                    |
   |                    | 1000ms no data
   |                    v
   |              [green] or [yellow]
   |                |         |
   |   (persists    |         | 1000ms more silence
   |    until       |         v
   |    dismiss)    |       [off]
   |                |
   |   dismiss()    |
   +<---------------+
```

### Burst Tracking

The hook uses `burstCountRef` and `inBurstRef` to distinguish shell startup output from actual task output:

- **Burst 1** = shell startup (initial prompt rendering). After burst 1 completes: blue -> off (idle).
- **Burst 2+** = user-initiated task output. After burst 2+ completes: blue -> green (persists).

This prevents newly created terminals from falsely showing a green "completed" indicator during their initial shell startup.

### States

| State | Color | Meaning |
|-------|-------|---------|
| `off` | Gray (#555) | Shell idle -- no output for 2+ seconds |
| `blue` | Blue (#4a9eff) | Actively receiving output (subtle pulse animation) |
| `green` | Green (#4aff7a) | Task completed -- persists until user interacts with the terminal |
| `yellow` | Yellow (#ffda4a) | AI instance waiting for user input |
| `orange` | Orange (#f97316) | Embedded window (always orange, not driven by state machine) |

### Transitions

1. **Data arrives** -> immediately transition to `blue`
2. **Output stops for 1000ms** (`COMPLETED_TIMEOUT_MS`) -> transition to:
   - `yellow` if AI CLI is detected AND output ends with an input prompt
   - `green` if burst count >= 2 (actual task output)
   - `off` if burst count == 1 (shell startup only)
3. **Green persists** until dismissed -- no auto-transition to off
4. **Dismiss** -> `green` transitions to `off`. `TerminalPanel` calls `dismiss()` on mousedown and when `isFocused` becomes true
5. **PTY exits with code 0** -> `green` only if `burstCount > 1` (a task actually ran), otherwise `off`
6. **PTY exits with non-zero code** -> immediately `off`

### Notification Integration

When transitioning from blue -> green (burst 2+), the hook calls `notifyTaskComplete(instanceName)`, which fires sound and desktop notifications according to the user's notification settings (see [Settings](settings.md)).

### Debouncing

The `updateState` function in the hook checks `currentStateRef.current === newState` before calling `setInstanceIndicator`. This prevents unnecessary store updates when the same state would be set repeatedly.

## AI CLI Auto-Detection

Implemented in `src/renderer/utils/aiDetect.ts`.

### isAiCli(output)

Scans the terminal output buffer for known AI CLI tool patterns:
- `claude`, `chatgpt`, `aider`, `copilot`, `cursor`, `github copilot`, `gpt-engineer`, `open-interpreter`

Uses case-insensitive regex matching. Returns `true` if any pattern matches.

### isWaitingForInput(recentOutput)

Checks if the most recent terminal output suggests an interactive prompt:
- Ends with `? `, `> `, or `: `
- Contains `(y/n)`, `[Y/n]`, `[y/N]`
- Last line is just `>` or `?` (with or without trailing space)

### Output buffer

The hook maintains a rolling 2048-character buffer (`OUTPUT_BUFFER_MAX`) of recent output for AI detection. This is separate from the global search output buffer.

## useIndicatorLight Hook

**Parameters:** `instanceId: string, workspaceId: string`

**Returns:**
- `indicatorState` -- Current state from the store
- `onData(data: string)` -- Callback to feed to `useTerminal`'s `onData` option
- `onExit(exitCode: number)` -- Callback to feed to `useTerminal`'s `onExit` option
- `dismiss()` -- Callback to clear a persisting green state back to off

**Usage in TerminalPanel:**
```typescript
const { onData: indicatorOnData, onExit: indicatorOnExit, dismiss } = useIndicatorLight(instanceId, activeWorkspaceId);

const terminalOptions = {
  onData: indicatorOnData,
  onExit: indicatorOnExit,
};

useTerminal(instanceId, containerRef, terminalOptions);

// Dismiss green indicator when user interacts with this terminal
<div onMouseDown={dismiss}>...</div>

useEffect(() => {
  if (isFocused) dismiss();
}, [isFocused]);
```

## IndicatorLight Component (`src/renderer/components/IndicatorLight.tsx`)

A pure presentational component that renders a colored circle.

**Props:**
- `state: 'off' | 'blue' | 'green' | 'yellow' | 'orange'`
- `size?: number` (default: 8)

**Visual effects:**
- Blue state has a CSS pulse animation (`indicator-pulse`, 1.5s ease-in-out infinite, opacity oscillates between 1 and 0.5)
- All non-off states have a colored `box-shadow` glow
- Color transitions use `transition: background-color 0.3s ease`

## Orange State for Embedded Windows

Embedded instances always display `orange` regardless of the state machine. This is handled in the `TitleBar` component:

```typescript
<IndicatorLight state={instance.type === 'embedded' ? 'orange' : instance.indicatorState} />
```

And in `getDefaultEmbeddedInstance()` in `src/shared/utils.ts`, the initial `indicatorState` is set to `'orange'`.
