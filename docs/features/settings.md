# Settings System

Settings are managed at three levels: Global (AppSettings), Project, and Instance. Each has its own dialog with a draft-then-save approach.

## Global Settings (`src/renderer/components/Settings/SettingsPanel.tsx`)

A modal panel with a tabbed layout (left sidebar tabs, right content area).

### Draft-then-save approach

1. When the panel opens, the current `settings` are snapshotted into a local `draft` state
2. All edits modify the draft only
3. On "Save", the draft is committed to the store via `updateSettings(draft)`
4. On "Cancel" or backdrop click, if there are unsaved changes, a `ConfirmDialog` appears with Save/Discard/Go Back options
5. `hasChanges()` compares draft to store settings field by field, handling arrays specially

### Tabs

The panel references sub-components `GeneralTab`, `AppearanceTab`, `CanvasTab`, `NotificationsTab`, `StartupTab`, `DataTab` (not all shown in the provided code but referenced in the component). Each tab receives `draft` and `updateDraft` props.

#### General Tab

Contains auto-start, default shell, default working directory, and a **Keyboard Shortcuts** section with a focus mode hotkey dropdown (options: F2, F6, F9, F11, F12; default F11).

#### Notifications Tab

- Desktop notifications toggle (native OS notifications when a task completes)
- Sound notifications toggle (two-tone chime when a task completes)
- Volume slider (0-100%, shown only when sound notifications are enabled) -- uses `SliderControl`, maps to `notificationVolume` (0-1)

#### Data Tab

Provides import/export functionality:

- **Export Layout Presets** -- saves active workspace presets to a JSON file
- **Export App Settings** -- saves current settings to a JSON file
- **Import Layout Presets** -- loads from file, appends to existing presets with name deduplication (appends a numeric suffix on collision)
- **Import App Settings** -- loads from file, replaces the draft state only; the user must click Save to apply changes

**File format:** Versioned JSON envelopes with a `type` discriminator field:
- `terminaldeck-settings` for app settings exports
- `terminaldeck-presets` for layout preset exports

**Validation:** On import, the system checks the `type` field, schema `version`, and payload structure before accepting the file. Invalid files are rejected with an error toast.

### All AppSettings fields

| Field | Type | Default | Tab |
|-------|------|---------|-----|
| `autoStartOnLogin` | boolean | false | General |
| `defaultShell` | string | 'system' | General |
| `defaultWorkingDirectory` | string | '' | General |
| `titleBarMode` | 'minimal' \| 'hideable' | 'minimal' | Appearance |
| `showProjectBorders` | boolean | true | Appearance |
| `theme` | string | 'system' | Appearance |
| `overlapMode` | 'none' \| 'allow' \| 'warning' | 'none' | Canvas |
| `zoomEnabled` | boolean | true | Canvas |
| `snapStrength` | number (0-1) | 0.8 | Canvas |
| `canvasMargin` | number (px) | 150 | Canvas |
| `toastNotifications` | boolean | false | Notifications |
| `soundNotifications` | boolean | false | Notifications |
| `notificationVolume` | number | 0.5 | Notifications |
| `focusModeHotkey` | string | 'F11' | General |
| `globalStartupCommands` | string[] | [] | Startup |
| `restoreOnStartup` | boolean | true | Startup |

## Project Settings (`src/renderer/components/Settings/ProjectSettingsDialog.tsx`)

A two-column modal dialog:
- **Left column:** Working Directory (with DirectoryPicker)
- **Right column:** Startup Commands (ordered list with add/remove)

Same draft-then-save approach with ConfirmDialog on unsaved close.

**Props:** `projectId`, `workspaceId`, `onClose`

**Actions on save:**
- `setProjectWorkingDir(workspaceId, projectId, workDir)`
- `setProjectStartupCommands(workspaceId, projectId, commands)`

## Instance Settings (`src/renderer/components/Settings/InstanceSettingsDialog.tsx`)

A two-column modal dialog:
- **Left column:** Shell (dropdown), Working Directory (DirectoryPicker), AI Instance toggle
- **Right column:** Startup Commands (ordered list with add/remove)

**Shell options:** System Default, PowerShell, PowerShell 7, CMD, Bash, Zsh.

**Props:** `instanceId`, `workspaceId`, `onClose`

**Actions on save:**
- `setInstanceShell(workspaceId, instanceId, shell)`
- `setInstanceWorkingDir(workspaceId, instanceId, workDir)`
- `setInstanceStartupCommands(workspaceId, instanceId, commands)`
- `setInstanceAiTag(workspaceId, instanceId, isAi)`

Note: Changing shell or working directory only takes effect when the instance is recreated. Existing PTYs are not restarted.

## New Project Dialog (`src/renderer/components/Settings/NewProjectDialog.tsx`)

A two-column modal for creating a new project:
- **Left column:** Project Name (required), Working Directory
- **Right column:** Startup Commands

On create:
1. Picks a color from a rotating 12-color palette based on project count
2. Creates the project via `createProject()`
3. Applies working directory and startup commands
4. Auto-creates a first terminal instance inside the project

## Delete Project Dialog (`src/renderer/components/Settings/DeleteProjectDialog.tsx`)

Shown when deleting a project that has instances. Three options:
- **Cancel** -- Do nothing
- **Keep Instances** -- Moves instances to ungrouped, then deletes the project
- **Delete All** -- Kills PTYs for terminal instances, releases embedded windows, deletes everything

## ConfirmDialog (`src/renderer/components/Settings/ConfirmDialog.tsx`)

A generic three-button confirmation modal:
- **Discard** -- Close without saving (red text)
- **Go Back** -- Return to the settings dialog
- **Save** -- Save and close

Used by SettingsPanel, ProjectSettingsDialog, and InstanceSettingsDialog when the user tries to close with unsaved changes.

## DirectoryPicker (`src/renderer/components/Settings/DirectoryPicker.tsx`)

A text input with a "Browse..." button that opens the native OS folder chooser via `window.terminalDeck.openFolderDialog()`. The IPC handler uses Electron's `dialog.showOpenDialog({ properties: ['openDirectory'] })`.

**Props:** `value: string`, `onChange: (path: string) => void`, `placeholder?: string`
