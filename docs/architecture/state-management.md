# State Management

The application uses a single Zustand store defined in `src/renderer/store/index.ts`, enhanced with **immer** middleware (for mutable-style immutable updates) and **persist** middleware (for saving state via Electron IPC).

## Store Structure

The store combines two types of state:

### AppState (persisted)
- `settings: AppSettings` -- Global application settings
- `workspaces: Workspace[]` -- All workspaces with their projects and instances
- `activeWorkspaceId: string` -- Currently active workspace

### UIState (transient, not persisted)
- `sidebarVisible: boolean` -- Whether the sidebar is shown (default: `true`)
- `focusedInstanceId: string | null` -- ID of the currently focused panel
- `focusModeActive: boolean` -- Whether focus mode is active
- `focusModeAnimating: boolean` -- Whether focus mode transition animation is playing
- `lastActiveProjectId: string | null` -- The project that last had an instance created in it (used for "smart" new instance placement)

The `partialize` option in the persist config ensures only `AppState` fields are saved:

```typescript
partialize: (state) => ({
  settings: state.settings,
  workspaces: state.workspaces,
  activeWorkspaceId: state.activeWorkspaceId,
}),
```

## Actions Reference

### Workspace Actions

| Action | Parameters | Behavior |
|--------|-----------|----------|
| `createWorkspace` | `name: string` | Appends a new workspace with default canvas state |
| `deleteWorkspace` | `id: string` | Removes workspace; prevents deleting the last one; switches active if needed |
| `renameWorkspace` | `id, name` | Updates workspace name |
| `setActiveWorkspace` | `id: string` | Sets `activeWorkspaceId` |

### Project Actions

| Action | Parameters | Behavior |
|--------|-----------|----------|
| `createProject` | `workspaceId, name, color` | Creates project; sets `lastActiveProjectId` |
| `deleteProject` | `workspaceId, projectId` | Moves project's instances to ungrouped, then removes project |
| `deleteProjectWithInstances` | `workspaceId, projectId` | Removes project and all its instances |
| `renameProject` | `workspaceId, projectId, name` | Updates project name |
| `setProjectColor` | `workspaceId, projectId, color` | Updates project color |
| `setProjectWorkingDir` | `workspaceId, projectId, dir` | Sets project working directory |
| `setProjectStartupCommands` | `workspaceId, projectId, commands` | Sets project startup commands |

### Instance Actions

| Action | Parameters | Behavior |
|--------|-----------|----------|
| `createInstance` | `workspaceId, name, projectId?` | Creates terminal instance with auto-positioned placement; inherits project working directory and startup commands |
| `createEmbeddedInstance` | `workspaceId, name, nativeHandle, appName, projectId?` | Creates embedded instance with `indicatorState: 'orange'` |
| `deleteInstance` | `workspaceId, instanceId` | Removes from container array, removes from canvas groups, clears focused if deleted |
| `renameInstance` | `workspaceId, instanceId, name` | Updates instance name |
| `moveInstance` | `workspaceId, instanceId, x, y` | Updates position |
| `resizeInstance` | `workspaceId, instanceId, width, height` | Updates size |
| `batchUpdateInstances` | `workspaceId, changes: Array<{id, x, y, width, height}>` | Applies multiple position/size updates in a single immer draft (used by cascade engine) |
| `moveInstanceToProject` | `workspaceId, instanceId, targetProjectId \| null` | Moves between project and ungrouped |
| `setInstanceShell` | `workspaceId, instanceId, shell` | Sets shell override |
| `setInstanceWorkingDir` | `workspaceId, instanceId, dir` | Sets working directory override |
| `setInstanceStartupCommands` | `workspaceId, instanceId, commands` | Sets instance startup commands |
| `setInstanceMinimized` | `workspaceId, instanceId, minimized` | When restoring, checks for overlap and finds free position if needed |
| `setInstanceIndicator` | `workspaceId, instanceId, state` | Updates indicator light state |
| `setInstanceAiTag` | `workspaceId, instanceId, isAi` | Sets the AI instance flag |

### Canvas Actions

| Action | Parameters | Behavior |
|--------|-----------|----------|
| `setPan` | `workspaceId, panX, panY` | Updates canvas pan offset |
| `setZoom` | `workspaceId, zoom` | Updates zoom, clamped to [0.25, 2.0] |
| `createGroup` | `workspaceId, instanceIds` | Creates a canvas group and tags each instance with `groupId` |
| `deleteGroup` | `workspaceId, groupId` | Removes group and clears `groupId` on member instances |
| `addToGroup` | `workspaceId, groupId, instanceId` | Adds instance to existing group |
| `removeFromGroup` | `workspaceId, groupId, instanceId` | Removes instance; auto-deletes empty groups |

### Settings Actions

| Action | Parameters | Behavior |
|--------|-----------|----------|
| `updateSettings` | `partial: Partial<AppSettings>` | Merges partial settings via `Object.assign` |
| `importLayoutPresets` | `workspaceId, presets` | Appends imported presets to the workspace's `layoutPresets` array with name deduplication (appends ` (2)`, ` (3)`, etc.) and newly generated IDs |

**Notable AppSettings fields:**
- `notificationVolume: number` (0-1) -- sound notification volume (default 0.5)
- `focusModeHotkey: string` -- configurable focus mode key (default `'F11'`)

### UI Actions

| Action | Parameters | Behavior |
|--------|-----------|----------|
| `toggleSidebar` | none | Toggles `sidebarVisible` |
| `setFocusedInstance` | `instanceId \| null` | Sets or clears the focused panel |
| `setFocusModeActive` | `active: boolean` | Enables/disables focus mode |
| `setFocusModeAnimating` | `animating: boolean` | Controls CSS transition on canvas transform |
| `scrollToInstance` | `instanceId: string` | Finds the instance, calculates the pan needed to center it in the viewport (accounting for sidebar width and zoom), calls `setPan()` and `setFocusedInstance()`. Used by sidebar click handler to scroll to and focus an instance. |

## findFreePosition Algorithm

Located in `src/renderer/store/index.ts` (line ~169). Called when creating instances or restoring minimized instances.

The function signature includes a `sidebarVisible` parameter to account for the sidebar offset.

**Algorithm:**
1. Compute the screen center, accounting for the sidebar (260px when visible): `screenCenterX = sidebarVisible ? sidebarWidth + (vpW - sidebarWidth) / 2 : vpW / 2`. Convert to world coordinates: `centerX = (screenCenterX - panX) / zoom - newW / 2`, `centerY = (screenCenterY - panY) / zoom - newH / 2`.
2. Try placing at the center. If it doesn't overlap any existing panel (with a 20px gap), use it.
3. If the center is occupied, spiral outward in grid steps (step size = panel size + 20px gap). Check rings 1 through 20.
4. Each ring checks all positions where `|dx| == ring` or `|dy| == ring` (the perimeter of the ring).
5. If no free position is found in 20 rings, fall back to placing at the far right of all existing panels.

**Overlap check:** AABB with 20px gap on all sides between the new panel and every existing non-minimized instance.

## lastActiveProjectId Tracking

When a new instance or project is created, `lastActiveProjectId` is set to that project's ID. This is used by the "New Instance" button in the sidebar -- if no project is explicitly specified, the new instance is created in the last active project rather than ungrouped.

## Persistence via Electron IPC

The persist middleware uses a custom `electronStorage` adapter (line ~222 in `src/renderer/store/index.ts`):

### Load (getItem)
- Calls `window.terminalDeck.stateLoad()` which invokes `state:load` IPC
- Main process reads `%APPDATA%/TerminalDeck/state.json`
- Returns `{ state: AppState, version: 0 }` (Zustand persist format)

### Save (setItem)
- **Debounced by 500ms** to avoid hammering disk on every state change
- Calls `window.terminalDeck.stateSave(value.state)` which invokes `state:save` IPC
- Main process writes to `state.json` with a version wrapper

### Remove (removeItem)
- No-op -- the state file is never deleted

## Secondary Stores

### snapGuidesStore (`src/renderer/stores/snapGuidesStore.ts`)
Plain Zustand store (no persist, no immer). Holds active snap guide lines during drag operations.

```typescript
interface SnapGuidesState {
  guides: SnapGuide[];
  setGuides: (guides: SnapGuide[]) => void;
  clearGuides: () => void;
}
```

### zOrderStore (`src/renderer/engine/zOrder.ts`)
Plain Zustand store. Manages z-index ordering. Not persisted -- resets each session.

```typescript
interface ZOrderState {
  order: string[];                    // Instance IDs, last = front
  bringToFront: (id: string) => void;
  getZIndex: (id: string) => number;  // Returns 1-based position, or 0 if untracked
  removeId: (id: string) => void;
}
```

### outputBuffer (`src/renderer/store/outputBuffer.ts`)
Not a Zustand store -- a plain `Map<string, string[]>` that collects terminal output per instance. Max 10,000 lines per instance. Used by Global Search (`Ctrl+Shift+F`) to search across all terminal output.
