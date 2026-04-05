# Import / Export

Export and import layout presets and app settings via the Data tab in Settings. Both operations use versioned JSON envelopes with a type discriminator to prevent importing the wrong file type.

## File Formats

Two JSON envelope types, defined in `src/shared/types.ts`:

### ExportedSettings

```typescript
interface ExportedSettings {
  type: 'terminaldeck-settings';  // type discriminator
  version: number;                // currently 1
  exportedAt: string;             // ISO 8601 timestamp
  payload: AppSettings;           // full settings object
}
```

### ExportedPresets

```typescript
interface ExportedPresets {
  type: 'terminaldeck-presets';   // type discriminator
  version: number;                // currently 1
  exportedAt: string;             // ISO 8601 timestamp
  payload: LayoutPreset[];        // array of layout presets
}
```

The `type` field acts as a discriminator -- importing a presets file where a settings file is expected (or vice versa) is rejected with an error toast (e.g. "Not a TerminalDeck settings file").

## Operations

All four operations are exposed as buttons in the Data tab (`DataTab.tsx`). Each follows a similar async flow using Electron IPC for file system access.

### Export Presets

1. Read the active workspace's `layoutPresets` from the store
2. If no presets exist, show a warning toast and abort
3. Serialize via `serializePresets()` (pretty-printed JSON with 2-space indent)
4. Open a native save dialog (`dialog:saveFile`) with default filename `layout-presets.json`
5. Write the JSON string to disk via `file:write`
6. Show a success toast: "Exported N preset(s)"

### Import Presets

1. Open a native file dialog (`dialog:openFile`) filtered to `.json` files
2. Read the file contents via `file:read`
3. Parse and validate with `parsePresets()` -- checks JSON structure, `type` field, `version`, and each preset's shape
4. If the file is empty (zero presets), show a warning toast
5. Call `importLayoutPresets(workspaceId, presets)` on the store, which:
   - Appends imported presets to the active workspace's existing presets
   - Deduplicates names: if a preset name already exists, appends `" (imported)"`, then `" (imported 2)"`, etc.
   - Assigns new IDs via `generateId()` -- original IDs from the file are discarded
6. Show a success toast: "Imported N preset(s)"

### Export Settings

1. Serialize the current settings draft via `serializeSettings(draft)`
2. Open a native save dialog with default filename `terminaldeck-settings.json`
3. Write the JSON string to disk via `file:write`
4. Show a success toast: "Settings exported"

### Import Settings

1. Open a native file dialog filtered to `.json` files
2. Read the file contents via `file:read`
3. Parse and validate with `parseSettings()` -- checks JSON structure, `type` field, `version`, and payload shape
4. Call `replaceDraft(parsed.data)` to replace the settings draft in the dialog
5. Show an info toast: "Settings imported -- click Save to apply"

**Note:** Imported settings replace the draft only. The user must click Save to commit the changes to the store. Closing the settings panel without saving discards the import.

## Validation

Implemented in `src/shared/exportImport.ts` as pure functions with no Node/Electron dependencies (safe to import in the renderer).

### parseSettings(raw)

Returns `{ ok: true, data: AppSettings }` or `{ ok: false, error: string }`. Checks:

1. Valid JSON
2. Top-level object with `type === 'terminaldeck-settings'`
3. `version === 1` (current export version)
4. `payload` is a non-null object
5. Payload passes `isValidSettings()` type guard -- checks that `theme` is a string, `zoomEnabled` is a boolean, `snapStrength` and `canvasMargin` are numbers

### parsePresets(raw)

Returns `{ ok: true, data: LayoutPreset[] }` or `{ ok: false, error: string }`. Checks:

1. Valid JSON
2. Top-level object with `type === 'terminaldeck-presets'`
3. `version === 1`
4. `payload` is an array
5. Each entry passes `isValidPreset()` type guard -- checks that `id` is a string, `name` is a string, `positions` is an array

## IPC Channels

Four IPC handlers in `src/main/main.ts` support the file operations. The preload bridge (`src/main/preload.ts`) exposes them on `window.terminalDeck`.

| IPC Channel | Preload Method | Purpose |
|-------------|---------------|---------|
| `dialog:saveFile` | `saveFileDialog(options)` | Show native save dialog, returns file path or null |
| `dialog:openFile` | `openFileDialog(options)` | Show native open dialog, returns file path or null |
| `file:write` | `writeFile(filePath, content)` | Write string to disk, returns `{ success, error? }` |
| `file:read` | `readFile(filePath)` | Read file as UTF-8, returns `{ success, content?, error? }` |

Both dialog handlers accept a `filters` array (e.g. `[{ name: 'JSON Files', extensions: ['json'] }]`). The file handlers use synchronous `fs.writeFileSync` / `fs.readFileSync` and catch errors into the result object.

## Key Files

| File | Purpose |
|------|---------|
| `src/shared/exportImport.ts` | `serializeSettings()`, `serializePresets()`, `parseSettings()`, `parsePresets()`, type guards |
| `src/shared/types.ts` | `ExportedSettings`, `ExportedPresets` interfaces |
| `src/renderer/components/Settings/DataTab.tsx` | UI with export/import buttons and async handlers |
| `src/renderer/store/index.ts` | `importLayoutPresets` action (append with dedup and new IDs) |
| `src/main/main.ts` | IPC handlers for `dialog:saveFile`, `dialog:openFile`, `file:write`, `file:read` |
| `src/main/preload.ts` | Bridge exposing IPC methods on `window.terminalDeck` |
