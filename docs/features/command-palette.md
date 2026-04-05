# Command Palette

A VS Code-style command palette that provides quick access to every action in TerminalDeck. Implemented in `src/renderer/components/CommandPalette/CommandPalette.tsx` with shortcut handling in `src/renderer/hooks/useKeyboardShortcuts.ts`.

## Trigger

- **Ctrl+Shift+P** (Windows/Linux) or **Cmd+Shift+P** (macOS) toggles the palette open/closed.
- Opening the command palette automatically closes the global search overlay, and vice versa. The two are mutually exclusive -- only one can be open at a time. This is enforced in `useKeyboardShortcuts`, which calls `setGlobalSearchOpen(false)` before opening the palette.

## Action Registry

Actions are built dynamically from the current Zustand store state by `getActions(store)` in `src/renderer/components/CommandPalette/actionRegistry.ts`. The function returns an array of `PaletteAction` objects:

```typescript
interface PaletteAction {
  id: string;
  label: string;
  category: string;
  keywords?: string[];
  execute: () => void;
}
```

Because the list is generated from live state, context-sensitive actions (e.g. "Close Instance") only appear when a relevant precondition is met (e.g. `store.focusedInstanceId` is set).

## Action Categories

| Category       | Example Actions                                              |
|----------------|--------------------------------------------------------------|
| **Instances**  | New Instance, Close Instance, Rename Instance                |
| **Projects**   | New Project, Delete Project                                  |
| **Workspaces** | New Workspace, Switch to "\<name\>" (one per non-active ws)  |
| **Layout**     | Grid Layout, Columns Layout, Rows Layout, Masonry Layout     |
| **View**       | Toggle Sidebar, Toggle Focus Mode, Zoom In/Out, Reset Zoom  |
| **Settings**   | Open Settings                                                |
| **Theme**      | Dark Theme, Light Theme, System Theme                        |

## Fuzzy Search

Typing in the input box filters the action list via `fuzzyFilter()` from `src/renderer/utils/fuzzySearch.ts`. The search text for each action is the concatenation of its `label`, `category`, and `keywords`. The fuzzy matcher requires each query character to appear in order in the target text and scores results with bonuses for:

- Consecutive character matches (+8)
- Word-boundary matches (+10) -- start of string or after `\s`, `-`, `_`, `/`, `.`, `:`, `>`
- Exact-case matches (+1)
- Early position in the string (diminishing bonus)
- Shorter target strings (length-ratio bonus)

Results are sorted best-score-first.

## Keyboard Navigation

| Key        | Behaviour                                |
|------------|------------------------------------------|
| **Up/Down arrows** | Move selection through the filtered list |
| **Enter**  | Execute the selected action              |
| **Escape** | Close the palette without executing      |

Mouse hover also moves the selection, and clicking an item executes it.

## UI Details

- The palette renders as a fixed overlay (`z-index: 10000`) with a 500px-wide panel centered near the top of the viewport.
- Max height is 400px; the action list scrolls when it overflows.
- The selected item is highlighted with an indigo left border (`#6366F1`) and a subtle blue background.
- A `>` prompt icon is displayed in the input bar.
- The footer shows keyboard hints for navigation.
- When opened, the query is cleared and the input is auto-focused via `requestAnimationFrame`.
- Actions execute after the palette closes (`requestAnimationFrame(() => action.execute())`) to avoid UI flicker.

## Key Files

- `src/renderer/components/CommandPalette/CommandPalette.tsx` -- palette component (input, list, keyboard handler)
- `src/renderer/components/CommandPalette/actionRegistry.ts` -- `getActions()` builds the action list from store state
- `src/renderer/utils/fuzzySearch.ts` -- `fuzzyMatch()` and `fuzzyFilter()` scoring logic
- `src/renderer/hooks/useKeyboardShortcuts.ts` -- registers Ctrl+Shift+P handler, manages open/close state
