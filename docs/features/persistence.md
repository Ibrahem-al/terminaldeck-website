# State Persistence

TerminalDeck persists application state (settings, workspaces, projects, instances) to disk so it survives app restarts.

## How it Works

### Save Path

State is stored at `%APPDATA%/TerminalDeck/state.json` (Windows). The path is computed via `app.getPath('userData')` from Electron.

### File Format

```json
{
  "version": 1,
  "state": {
    "settings": { ... },
    "workspaces": [ ... ],
    "activeWorkspaceId": "..."
  }
}
```

The `version` field (currently `1`) exists for future migration support. If the version doesn't match `CURRENT_VERSION`, the file is ignored.

## Zustand Persist Middleware

The store uses Zustand's `persist` middleware with a custom `electronStorage` adapter (`src/renderer/store/index.ts`, line ~222).

### Custom Storage Adapter

```typescript
const electronStorage = {
  getItem: async () => {
    const loaded = await window.terminalDeck.stateLoad();
    return { state: loaded.state ?? loaded, version: 0 };
  },
  setItem: (_name, value) => {
    // Debounced 500ms
    clearTimeout(timer);
    timer = setTimeout(() => {
      window.terminalDeck.stateSave(value.state);
    }, 500);
  },
  removeItem: () => { /* no-op */ },
};
```

### Debounced Saves

Saves are debounced with a 500ms timeout. Every state change resets the timer. This means rapid changes (like dragging a panel) only write to disk once, 500ms after the last change.

### What Gets Persisted

Only `AppState` fields are persisted (via `partialize`):
- `settings` -- All AppSettings
- `workspaces` -- All workspaces with projects and instances
- `activeWorkspaceId` -- Currently selected workspace

**Not persisted:**
- `sidebarVisible` -- Resets to `true` each session
- `focusedInstanceId` -- Resets to `null`
- `focusModeActive` -- Resets to `false`
- `focusModeAnimating` -- Resets to `false`
- `lastActiveProjectId` -- Resets to `null`
- Z-order (separate store, not persisted)
- Snap guides (separate store, not persisted)
- Terminal output buffers (in-memory only)
- Terminal scrollback (not captured at all)

## Main Process Persistence (`src/main/persistence.ts`)

### saveState(state)

1. Wraps `AppState` in `PersistedState` with `version: 1`
2. Ensures the directory exists (`mkdirSync` with recursive)
3. Writes JSON with 2-space indentation via `writeFileSync`
4. Errors are caught and logged (a failed save doesn't crash the app)

### loadState()

1. Checks if the file exists
2. Reads and parses JSON
3. Validates: must have `version` (number) and `state` (object)
4. Rejects if version doesn't match `CURRENT_VERSION`
5. Returns `AppState | null` (null on any error)

## restoreOnStartup Setting

The `restoreOnStartup` setting (default: `true`) controls what happens at app start:

- **true:** The persisted state is loaded by Zustand's persist middleware. Instances are already in the store when components mount. Each `TerminalPanel` component spawns a new PTY on mount, effectively restoring the workspace.
- **false:** The `restoreInstances()` function in `useInstanceLifecycle` clears all instances from the active workspace on startup, giving the user a fresh session.

**Important:** Even when `restoreOnStartup` is false, the settings and workspace structure are still restored -- only the terminal instances are cleared.

## Import/Export (`src/main/importExport.ts`)

### exportWorkspace(state, filePath)

Writes the full `AppState` to a user-chosen file path with the same `PersistedState` format.

### importWorkspace(filePath)

1. Reads and parses the file
2. Validates via `isPersistedState()` type guard:
   - Must be an object with `version` (number) and `state` (object)
   - `state` must have `settings` (object), `workspaces` (array), `activeWorkspaceId` (string)
3. Rejects if version doesn't match
4. Returns `AppState | null`

Note: The import/export IPC channels are not yet registered in `main.ts` -- the functions exist but are not wired up to the renderer.
