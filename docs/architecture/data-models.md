# Data Models

All core types are defined in `src/shared/types.ts`. The hierarchy is: **Workspace > Project > Instance**.

## Workspace

```typescript
interface Workspace {
  id: string;                          // UUID via crypto.randomUUID()
  name: string;                        // User-facing name (default: "Default")
  projects: Project[];                 // Ordered list of projects
  ungroupedInstances: Instance[];      // Instances not assigned to any project
  canvasState: CanvasState;            // Pan, zoom, and group data for this workspace
  layoutPresets: LayoutPreset[];       // Saved layout snapshots
}
```

A workspace is the top-level container. The app always has at least one workspace (deletion of the last workspace is prevented). Each workspace has its own canvas state (pan/zoom position) and its own set of projects and ungrouped instances.

## Project

```typescript
interface Project {
  id: string;                          // UUID
  name: string;                        // User-facing name
  color: string;                       // Hex color (e.g., "#3B82F6") from rotating palette
  workingDirectory?: string;           // Default cwd for all instances in this project
  startupCommands: string[];           // Commands run after global commands for instances in this project
  instances: Instance[];               // Ordered list of instances belonging to this project
}
```

Projects group related terminal instances. When a project is deleted, the user can choose to keep instances (moved to ungrouped) or delete them all.

**Color palette** (defined in `src/shared/utils.ts`): blue, emerald, amber, red, violet, pink, cyan, orange -- assigned by index modulo 8.

## Instance

```typescript
interface Instance {
  id: string;                          // UUID, also used as the PTY identifier
  name: string;                        // User-facing name (default: "Terminal N")
  type: 'terminal' | 'embedded';       // Determines content type
  projectId?: string;                  // Owning project ID, or undefined if ungrouped
  groupId?: string;                    // Canvas group ID, or undefined if not grouped
  position: { x: number; y: number };  // World-space position (top-left corner)
  size: { width: number; height: number }; // World-space dimensions (default: 600x400)
  shell?: string;                      // Shell override (undefined = use default)
  workingDirectory?: string;           // Working directory override
  startupCommands?: string[];          // Instance-specific startup commands
  startupMode: 'extend' | 'override'; // How instance commands combine with global/project
  isAiInstance: boolean;               // Manual or auto-detected AI CLI tag
  isMinimized: boolean;                // Whether the panel is hidden from the canvas
  indicatorState: 'off' | 'blue' | 'green' | 'yellow' | 'orange';
  // Embedded window fields (only used when type === 'embedded')
  nativeHandle?: number;               // Win32 HWND
  appName?: string;                    // Name of the embedded application
  appIcon?: string;                    // Base64 icon (currently unused)
}
```

### Dual nature of Instance

The `Instance` type serves double duty:

1. **Terminal instances** (`type: 'terminal'`): Backed by a node-pty process. The `id` is used as the PTY identifier. The `shell`, `workingDirectory`, `startupCommands`, and `startupMode` fields control how the PTY is spawned.

2. **Embedded instances** (`type: 'embedded'`): Backed by a DWM Thumbnail of an external OS window. The `nativeHandle` field holds the Win32 HWND. The live window content is rendered by DWM into the Electron window's compositor layer. Input is forwarded via PostMessage. The `indicatorState` is always `'orange'` for embedded instances.

### Default values (from `src/shared/utils.ts`)

| Field | Default |
|-------|---------|
| `type` | `'terminal'` |
| `position` | `{ x: 100, y: 100 }` (before free-position adjustment) |
| `size` | `{ width: 600, height: 400 }` |
| `startupMode` | `'extend'` |
| `isAiInstance` | `false` |
| `isMinimized` | `false` |
| `indicatorState` | `'off'` (terminal) / `'orange'` (embedded) |

## CanvasState

```typescript
interface CanvasState {
  panX: number;    // Horizontal pan offset in screen pixels (default: 0)
  panY: number;    // Vertical pan offset in screen pixels (default: 0)
  zoom: number;    // Zoom level, range 0.25-2.0 (default: 1.0)
  groups: InstanceGroup[];  // Canvas groups
}
```

## InstanceGroup

```typescript
interface InstanceGroup {
  id: string;              // UUID
  instanceIds: string[];   // IDs of instances in this group
}
```

Groups enable dragging multiple panels together. When any member of a group is dragged, all members move by the same delta.

## LayoutPreset

```typescript
interface LayoutPreset {
  id: string;
  name: string;
  positions: LayoutPresetPosition[];
}

interface LayoutPresetPosition {
  instanceId: string;  // Matched by ID first, then by index
  x: number;
  y: number;
  w: number;
  h: number;
}
```

## AppSettings

```typescript
interface AppSettings {
  autoStartOnLogin: boolean;           // Default: false (not yet implemented)
  defaultShell: string | 'system';     // Default: 'system' (auto-detect)
  defaultWorkingDirectory: string;     // Default: '' (uses HOME/USERPROFILE)
  titleBarMode: 'minimal' | 'hideable'; // Default: 'minimal'
  showProjectBorders: boolean;         // Default: true
  theme: string;                       // 'system' | 'dark' | 'light' | 'solarized' | 'solarized-light'
  overlapMode: 'none' | 'allow' | 'warning'; // Default: 'none' (prevent overlap)
  zoomEnabled: boolean;                // Default: true
  snapStrength: number;                // 0-1 (maps to 0-50px threshold). Default: 0.8
  canvasMargin: number;                // Pixels of breathing room at canvas edges. Default: 150
  toastNotifications: boolean;         // Default: false
  soundNotifications: boolean;         // Default: false
  globalStartupCommands: string[];     // Default: [] -- run for every new terminal
  restoreOnStartup: boolean;           // Default: true -- restore persisted instances
}
```

### Settings field effects

| Field | Effect |
|-------|--------|
| `titleBarMode: 'hideable'` | Panel title bars auto-hide, appearing on hover |
| `overlapMode: 'none'` | Dragged panels are pushed to nearest free position on collision |
| `overlapMode: 'warning'` | Overlapping panels are reported but allowed |
| `overlapMode: 'allow'` | No collision detection at all |
| `snapStrength: 0` | Snapping disabled |
| `snapStrength: 1` | Maximum snap threshold (50px) |
| `restoreOnStartup: false` | All instances cleared on app start (fresh session) |

## AppState

```typescript
interface AppState {
  settings: AppSettings;
  workspaces: Workspace[];
  activeWorkspaceId: string;
}
```

This is the root state that gets persisted and restored.

## PersistedState

```typescript
interface PersistedState {
  version: number;   // Currently 1 -- for future migrations
  state: AppState;
}
```

Wraps `AppState` with a version field. Stored as `state.json` in `%APPDATA%/TerminalDeck/`.

## Relationship Diagram

```
AppState
  |-- settings: AppSettings
  |-- workspaces: Workspace[]
  |     |-- projects: Project[]
  |     |     |-- instances: Instance[] (type: terminal | embedded)
  |     |-- ungroupedInstances: Instance[]
  |     |-- canvasState: CanvasState
  |     |     |-- groups: InstanceGroup[]
  |     |-- layoutPresets: LayoutPreset[]
  |-- activeWorkspaceId: string
```
