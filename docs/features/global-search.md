# Global Search

Full-text search across instance names and terminal output buffers. Implemented in `src/renderer/components/CommandPalette/GlobalSearch.tsx` with output storage in `src/renderer/store/outputBuffer.ts`.

## Trigger

- **Ctrl+Shift+F** (Windows/Linux) or **Cmd+Shift+F** (macOS) toggles the search overlay open/closed.
- **Clicking the search bar** in the title bar (`AppTitleBar`) calls `onOpenSearch`, which invokes `openGlobalSearch()` from `useKeyboardShortcuts`.
- Opening global search automatically closes the command palette. The two overlays are mutually exclusive.

## Search Behaviour

When the user types a query, a debounced search (150ms `setTimeout`) runs in two phases:

1. **Instance name matching** -- iterates all instances in the active workspace (both ungrouped and inside projects). Uses a simple case-insensitive `indexOf` on `instance.name`.
2. **Terminal output matching** -- calls `searchAll(query)` from `outputBuffer.ts`, which performs a case-insensitive `indexOf` scan across every buffered line for every instance.

Results are combined with name matches first, then output matches, and **capped at 200 results**.

## Result Display

### Name matches
- `lineNumber` is set to `0` to distinguish them from output matches.
- Displayed with the accent colour (`var(--accent)`) and an italic "instance" label on the right.
- The matching substring is highlighted.

### Output matches
- Show the instance name, line number (e.g. `L42`), and the matched line in a monospace font.
- The matching substring is highlighted with a yellow background (`rgba(250, 204, 21, 0.3)`) and `#FACC15` text.

The result count is shown in the input bar (e.g. "42 results" or "200+ results" when the cap is hit).

## Output Buffer

`src/renderer/store/outputBuffer.ts` maintains an in-memory, per-instance rolling buffer of terminal output:

- **Max lines per instance:** 10,000 (`MAX_LINES_PER_INSTANCE`)
- When the limit is exceeded, the oldest lines are trimmed via `lines.splice(0, excess)`.
- `appendOutput(instanceId, data, name?)` splits incoming data on `\n` and appends to the buffer. If the last buffered line was partial (no trailing newline), the new data is concatenated to it.
- `searchAll(query)` returns `SearchResult[]` with `instanceId`, `instanceName`, `lineNumber`, `line`, `matchStart`, and `matchEnd`.
- Utility functions: `getOutput`, `clearOutput`, `removeInstance`, `setInstanceName`, `getBufferedInstanceIds`.

## Keyboard Navigation

| Key        | Behaviour                                         |
|------------|---------------------------------------------------|
| **Up/Down arrows** | Move selection through the result list   |
| **Enter**  | Focus the matching instance (`store.scrollToInstance`) and close the overlay |
| **Escape** | Close the search overlay                          |

Mouse hover moves the selection; clicking a result focuses the instance.

## UI Details

- Fixed overlay at `z-index: 10000`, with a 600px-wide panel (max height 500px) centered near the top of the viewport.
- The selected result has an indigo left border (`#6366F1`) and a subtle blue background.
- When opened, the query and results are cleared and the input is auto-focused.
- Placeholder text reads "Search instances and terminal output...".

## Key Files

- `src/renderer/components/CommandPalette/GlobalSearch.tsx` -- search overlay component (input, result list, keyboard handler)
- `src/renderer/store/outputBuffer.ts` -- per-instance output buffer and `searchAll()` implementation
- `src/renderer/components/AppTitleBar.tsx` -- search bar button in the title bar that triggers `onOpenSearch`
- `src/renderer/hooks/useKeyboardShortcuts.ts` -- registers Ctrl+Shift+F handler, manages open/close state
