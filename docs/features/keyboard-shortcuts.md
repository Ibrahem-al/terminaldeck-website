# Keyboard Shortcuts

TerminalDeck registers global keyboard shortcuts at the document level using capture-phase `keydown` listeners. This ensures shortcuts are caught before any other handlers in the component tree.

## Shortcut Reference

| Shortcut | Action | Configurable? |
|----------|--------|---------------|
| Ctrl+Shift+P (Cmd+Shift+P on Mac) | Open Command Palette | No |
| Ctrl+Shift+F (Cmd+Shift+F on Mac) | Open Global Search | No |
| Focus Mode Hotkey (default F11) | Toggle Focus Mode | Yes -- Settings > General > Keyboard Shortcuts |
| Escape | Exit Focus Mode (when active) | No |
| Up/Down arrows | Navigate results in Command Palette / Global Search | No |
| Enter | Execute selected action / Focus selected result | No |

## Platform Detection

Ctrl vs Cmd is resolved at runtime using `navigator.platform`. When the platform string contains `MAC` (case-insensitive), shortcuts use `metaKey` (Cmd). On all other platforms they use `ctrlKey` (Ctrl).

## Configurable Focus Mode Hotkey

The focus mode toggle key is stored as `focusModeHotkey` in `AppSettings`. Users can change it through **Settings > General > Keyboard Shortcuts**. The available options are:

- F2
- F6
- F9
- F11 (default)
- F12

The `GeneralTab` settings component renders a `<SelectControl>` for this option. When the selected key is pressed, `useKeyboardShortcuts` calls `toggleFocusMode()` from the `useFocusMode` hook.

## Implementation Details

### Registration

All shortcuts are registered in the **capture phase** (`addEventListener('keydown', handler, true)`) so they fire before any bubbling-phase handlers attached to child elements. Each handler calls `e.preventDefault()` and `e.stopPropagation()` to prevent the browser or other listeners from reacting to the key press.

### Mutual Exclusivity

Command Palette and Global Search are mutually exclusive -- opening one automatically closes the other. This is enforced inside `useKeyboardShortcuts` by toggling state setters in sequence.

### Escape Key

The Escape handler lives in `useFocusMode`, not in `useKeyboardShortcuts`. It checks whether focus mode is currently active (`isFocusModeRef.current`) before acting, so pressing Escape in normal mode has no effect from this handler.

## Key Files

| File | Role |
|------|------|
| `src/renderer/hooks/useKeyboardShortcuts.ts` | Registers Ctrl/Cmd+Shift+P, Ctrl/Cmd+Shift+F, and the configurable focus mode hotkey |
| `src/renderer/hooks/useFocusMode.ts` | Registers the Escape key handler for exiting focus mode |
| `src/renderer/components/Settings/GeneralTab.tsx` | Settings UI for changing the focus mode hotkey |
