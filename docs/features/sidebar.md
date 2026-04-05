# Sidebar

The left sidebar (`src/renderer/components/Sidebar/Sidebar.tsx`) provides workspace management, project organization, and quick access to all instances. Width is fixed at 260px.

## Structure

```
+---------------------------+
| WorkspaceSwitcher         |
|  [Default Workspace  v]  |
+---------------------------+
| PROJECTS                  |
|  > ProjectA (3)           |
|    - Terminal 1           |
|    - Terminal 2           |
|    - Terminal 3           |
|  > ProjectB (1)           |
|    - Terminal 4           |
+---------------------------+
| UNGROUPED                 |
|    - Terminal 5           |
|    - Terminal 6           |
+---------------------------+
+---------------------------+
| [+ New Instance        ]  |
| [+ New Project         ]  |
+---------------------------+
| [Layout] [Settings]      |
+---------------------------+
```

## Workspace Switcher (`src/renderer/components/Sidebar/WorkspaceSwitcher.tsx`)

A dropdown at the top of the sidebar showing the active workspace name. Clicking it reveals a list of all workspaces plus a "New Workspace" option. Closes on outside click.

## Project Tree

### ProjectItem (`src/renderer/components/Sidebar/ProjectItem.tsx`)

Each project shows:
- Expand/collapse chevron (click to toggle)
- Colored circle (project color)
- Project name (double-click to inline rename)
- Instance count badge

**Context menu (right-click):** Portalled to `document.body` to escape sidebar overflow.
- New Instance -- Creates a new terminal in this project using the next available "Terminal N" name. Calls the `onCreateInstance(projectId)` prop, which maps to `Sidebar.handleCreateInstanceInProject(projectId)`.
- Settings... -- Opens ProjectSettingsDialog
- Rename -- Activates inline edit
- Change Color -- Submenu with 24 preset color swatches
- Delete -- Opens DeleteProjectDialog

**Props:** `ProjectItem` receives an `onCreateInstance` prop passed down from `Sidebar`.

**Drag-and-drop target:** Projects accept instance drops. When an instance is dragged over a project, it highlights. On drop, calls `moveInstanceToProject`.

### InstanceItem (`src/renderer/components/Sidebar/InstanceItem.tsx`)

Each instance shows:
- Indicator light (7px)
- Instance name (double-click to inline rename)
- Minimized instances shown in italic with "---" prefix and gray color

**Draggable:** Instances can be dragged between projects. The drag data is `JSON.stringify({ instanceId })`.

**Click behavior:**
- If minimized, restores the instance first
- Scrolls the canvas to center the clicked instance in the viewport using the store's `scrollToInstance(instanceId)` action, which calculates the pan offset needed and calls `setPan()` + `setFocusedInstance()`
- The terminal auto-focuses via the existing `useEffect` in `TerminalPanel`

**Context menu (right-click):** Portalled to `document.body`.
- Rename
- Move to Project... -- Submenu listing all projects plus "Ungrouped"
- Delete

## Sections

### Projects section
Visible when `workspace.projects.length > 0`. Each project rendered as a `ProjectItem`.

### Ungrouped section
Shows terminal instances (`type !== 'embedded'`) from `workspace.ungroupedInstances`. Accepts drag-and-drop of instances to "ungroup" them.

### Windows section
Shows embedded instances (`type === 'embedded'`) from the active workspace. Each embedded instance appears as an `InstanceItem` with the same click, rename, and context menu behavior as terminal instances. See [Window Embedding](window-embedding.md) for details.

## Action Buttons

At the bottom of the sidebar:

| Button | Action |
|--------|--------|
| **+ New Instance** | Creates a terminal in the last active project (or ungrouped). Auto-increments name. |
| **+ New Project** | Opens NewProjectDialog (portalled to body) |
| **+ Embed Window** | Opens the WindowPicker dialog to select an external window for embedding. See [Window Embedding](window-embedding.md). |

## Bottom Toolbar

Two equal-width buttons below the action buttons:
- **Layout** -- Toggles the LayoutPicker panel
- **Settings** -- Opens the SettingsPanel

## Sidebar Visibility

The sidebar slides in/out with a 0.25s CSS transform transition. When hidden, `transform: translateX(-260px)` and `opacity: 0`. The canvas area shifts left accordingly via `left: sidebarVisible ? 260 : 0` with a matching transition.

Toggle is controlled by `useStore.toggleSidebar()`, triggered by the sidebar toggle button in the app title bar.

## Portal Usage

Several components use `createPortal(element, document.body)` to render outside the sidebar's DOM tree:
- **Context menus** (ProjectItem, InstanceItem) -- Prevents clipping by sidebar's `overflow: hidden`
- **NewProjectDialog** -- Modal overlay
- **WindowPicker** -- Modal overlay
- **DeleteProjectDialog** -- Modal overlay
- **ProjectSettingsDialog** -- Modal overlay

This is critical because the sidebar has `overflow: hidden` and context menus/dialogs need to render at the viewport level.

## Drag-and-Drop

Instances can be dragged between projects and to/from the ungrouped section:

1. `InstanceItem` sets `draggable` and `onDragStart` with payload `{ instanceId }`
2. `ProjectItem` and the ungrouped section implement `onDragOver`, `onDragLeave`, `onDrop`
3. On drop, `moveInstanceToProject` is called with the target project ID (or `null` for ungrouped)
4. Visual feedback: drop targets highlight via CSS variable-based styling

## Inline Rename

Both projects and instances support inline rename via double-click:

1. Double-click the name text
2. An input field appears in place of the text
3. On Enter or blur, the new name is committed (if non-empty and changed)
4. On Escape, the rename is cancelled
5. The input auto-focuses and auto-selects all text on activation
