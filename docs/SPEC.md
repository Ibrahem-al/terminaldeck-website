# TerminalDeck — Specification Document

## Context

This document is a **specifications-only** artifact. It defines what TerminalDeck is, how it should behave, and every feature it must support. No code is being written yet — this serves as the source of truth for future implementation planning and development.

**Problem:** Power users who work across multiple terminal sessions (AI agents, servers, builds, environments) have no native tool that lets them visually arrange, organize, and monitor many terminals simultaneously on a spatial canvas. Existing terminal apps (iTerm2, Windows Terminal, Hyper) are tab/pane-based and don't support free-form spatial layouts, project grouping, or AI-aware status indicators.

**Goal:** A native desktop application (Windows + macOS) that gives users a spatial canvas of terminal instances organized into projects and workspaces — with snapping, grouping, persistence, theming, and intelligent status indicators.

---

## 1. Platform & Technology

| Attribute | Decision |
|-----------|----------|
| Runtime | **Electron** |
| Target OS | Windows, macOS |
| Terminal emulator | **xterm.js** (embedded in each instance) |
| Shell support | System default shell (PowerShell on Windows, zsh/bash on macOS), configurable per-project and per-instance |

---

## 2. Core Concepts

### 2.1 Hierarchy

```
Workspace (top-level)
  └── Project (organizational container)
        └── Instance (terminal session)
```

- **Workspaces** — Completely separate canvas layouts. E.g., "Work" and "Personal". Each workspace has its own canvas, projects, and instances. Users switch between workspaces.
- **Projects** — Named groups with an assigned color. Contain instances. Have configurable default startup commands and working directory.
- **Instances** — Individual terminal sessions rendered as resizable panels on the canvas.

### 2.2 Instance Defaults & Creation

- An instance can be created without a project, but **by default** it is added to the last project that was interacted with (last project created OR last project an instance was added to).
- Instances and projects are **renamable**.
- Instances can be **moved between projects** (drag in sidebar or via context menu).
- Each instance is a general-purpose terminal. Users can run anything — shell commands, AI CLIs, scripts, etc.

---

## 3. Canvas & Layout

### 3.1 Canvas Model: Hybrid Free-Form + Snap

- Instances are positioned freely on a 2D canvas via drag-and-drop.
- **Magnetic snapping**: When an instance edge comes near another instance's edge, it snaps into alignment (like puzzle pieces). This encourages tiled layouts without enforcing them.
- Snap strength should feel natural — easy to align, but not fighting the user.

### 3.2 Overlap Behavior (Settings-configurable)

| Setting | Behavior |
|---------|----------|
| **No overlap** (default) | Collision detection prevents instances from overlapping. Pushing behavior when dragging into occupied space. |
| **Allow overlap** | Free overlap like OS windows. Clicking an overlapped instance brings it to front (z-order). |
| **Overlap with warning** | Allow overlap but dim/add transparency to stacked instances to signal the overlap. |

Regardless of overlap setting: **clicking into any instance brings it to front** (z-order behavior).

### 3.3 Canvas Boundaries

- The canvas extends **slightly beyond** the outermost instances (a configurable margin, e.g., 100-200px) in all directions.
- This prevents accidental infinite scrolling while still giving breathing room.
- As instances are moved, the boundary dynamically adjusts.

### 3.4 Pan & Zoom

- **Pan**: Click-and-drag on empty canvas space, or scroll to pan.
- **Zoom**: Ctrl+Scroll (Windows) / Cmd+Scroll (macOS) or trackpad pinch to zoom in/out.
- Zoom can be **disabled in settings** (pan-only mode).
- Zoom range: 25% – 200% (suggested).

### 3.5 Focus Mode

- A hotkey (configurable) maximizes a single instance to fill the entire app window.
- **Smooth zoom animation** transitioning into the focused instance, dimming all others.
- Press Esc or the same hotkey to return to the canvas layout at previous pan/zoom position.

---

## 4. Instance Panels

### 4.1 Title Bar

Two modes, switchable in **Settings**:

**Minimal Bar (default):**
```
┌─● Instance Name  [Project: Name] ─ _ ×─┐
│                                          │
│  $ _                                     │
│                                          │
└──────────────────────────────────────────┘
```

**Hideable Bar:**
- Same content as minimal bar.
- Auto-hides when the mouse is not hovering over the instance.
- Only the terminal content is visible when not hovered.

**Title bar elements:**
- Indicator light (see §4.2)
- Instance name (editable inline or via context menu)
- Project color dot
- Minimize button (collapse to sidebar)
- Close button (terminate shell session)
- Drag handle (entire title bar is draggable)

### 4.2 Indicator Light

A small colored circle on the title bar that conveys instance status:

| Color | State | Context |
|-------|-------|---------|
| **Off / Gray** | Idle | Shell is at a prompt, nothing running |
| **Blue** | Active | A command/process is running (normal terminal) OR AI is generating output (AI instance) |
| **Green** | Done | A command/task has completed |
| **Yellow** | Waiting for input | *AI instances only* — The AI has asked a question or is waiting for user input |

**AI detection:**
- **Auto-detect**: The app recognizes known AI CLI processes (e.g., `claude`, `chatgpt`, `aider`, `copilot`) running in the shell and automatically enables AI-specific indicator behavior (yellow state).
- **Manual tag**: Users can also manually mark any instance as "AI instance" in instance settings.
- Both methods coexist — auto-detect catches common cases, manual tag covers custom/unknown tools.

### 4.3 Resize

- Instances are resizable from all edges and corners.
- Minimum size enforced (e.g., 300×200px) to keep terminals usable.
- When resized, the embedded xterm.js terminal reflows to the new dimensions.

---

## 5. Instance Grouping

Instances can be **grouped** so they behave as a unit:

- **Movement**: Moving one instance in a group moves the entire group.
- **Individual resize**: Each instance within a group can be independently resized. The group adjusts — neighbors shift to accommodate, maintaining adjacency.
- **Creating a group**: Select multiple instances → right-click → "Group" (or drag one onto another with a modifier key).
- **Ungrouping**: Right-click group → "Ungroup" to release all instances back to independent movement.
- Groups replace the need for split-pane terminals — users snap instances together and group them.

---

## 6. Sidebar (Left Panel)

### 6.1 Structure

```
┌─────────────────────────┐
│ ☰  WORKSPACE: Work    ▼ │
├─────────────────────────┤
│ ▼ 🔴 Project: Server    │
│     ├─ ● Backend API     │
│     ├─ ● Database        │
│     └─ ● Redis           │
│ ▼ 🔵 Project: Frontend   │
│     ├─ ● Dev Server      │
│     └─ ● Tests           │
│ ── Ungrouped ──          │
│     └─ ● Scratch         │
├─────────────────────────┤
│ [+ New Instance]         │
│ [+ New Project]          │
└─────────────────────────┘
```

- **Hideable**: Toggle sidebar visibility with a button or hotkey.
- Projects are shown with their assigned color.
- Instances are indented under their parent project.
- Instances without a project appear under an "Ungrouped" section.
- **Click behavior**: Clicking an instance in the sidebar **scrolls the canvas** to that instance, **gives it keyboard focus**, and **briefly highlights/pulses the border** so it's easy to spot.
- **Drag-and-drop**: Instances can be dragged between projects in the sidebar.
- Each entry shows the indicator light status.

### 6.2 Workspace Switcher

- At the top of the sidebar, a dropdown or tab bar to switch between workspaces.
- Each workspace has a completely independent canvas and project set.

---

## 7. Startup Commands (Cascading Inheritance)

Startup commands run automatically when an instance is created. They follow a 3-tier cascade:

```
Global defaults → Project defaults → Instance overrides
```

| Level | Example | Behavior |
|-------|---------|----------|
| **Global** | `source ~/.bashrc` | Runs for every new instance in any project |
| **Project** | `cd ~/projects/server && source .env` | Runs for every instance in this project (after global) |
| **Instance** | `claude` then `/effort max` | Runs for this specific instance (after project) |

- Each level can define **multiple sequential commands** (executed in order).
- Lower levels **extend** higher levels by default, but can be set to **override** (skip inherited commands).
- **Example shown to user in UI**: "e.g., `claude` to start Claude, then `/effort max` to set thinking to maximum"

---

## 8. Working Directory

- **Project-level**: Each project can specify a working directory. All instances in that project start in that directory.
- **Instance-level override**: An instance can specify its own working directory, overriding the project default.
- **Fallback**: If no directory is configured at either level, the instance starts in the user's home directory (`~` / `%USERPROFILE%`).

---

## 9. Persistence & State Restoration

On app restart, **everything is restored**:

- All workspaces, projects, and instances (names, colors, settings)
- Canvas positions, sizes, zoom level, and groupings
- Terminal scrollback/output history
- Startup commands are **re-run** for each instance (restoring the shell environment)
- Sidebar state (expanded/collapsed projects, sidebar visibility)

Storage format: Local file (JSON or SQLite) in the app's data directory.

---

## 10. Auto-Arrange & Layout Presets

### 10.1 Built-in Layouts

A toolbar button or command palette action to auto-arrange all visible instances:

- **Grid** — Equal-sized tiles in a grid
- **Columns** — Vertical columns, one instance per column
- **Rows** — Horizontal rows, one instance per row
- **Masonry** — Variable-height tiles packed efficiently

### 10.2 Custom Presets

- Users can **save the current layout** as a named preset.
- Presets store: instance positions, sizes, and groupings.
- Presets can be applied to **rearrange** existing instances.
- Presets are per-workspace.

---

## 11. Settings

### 11.1 Settings Categories

**General:**
- Auto-start app on system login (on/off)
- Default shell selection
- Default working directory

**Appearance:**
- Theme selection (built-in themes: dark, light, solarized, etc.)
- Default follows system light/dark mode setting
- Full custom color support (via hex picker)
- Title bar mode: Minimal (default) / Hideable
- Project border on instances: on (default) / off

**Canvas:**
- Overlap mode: No overlap (default) / Allow overlap / Overlap with warning
- Zoom enabled: on (default) / off
- Snap strength adjustment
- Canvas margin size

**Notifications:**
- Visual notifications (toast) when task completes in unfocused instance: on/off
- Sound notifications on task completion: on/off
- Configurable per-instance notification overrides

**Startup Commands:**
- Global startup commands editor
- (Project/instance-level commands configured in their respective settings)

**Project Colors:**
- Colors are **auto-assigned** from a rotating palette when a new project is created.
- 4–8 preset color swatches for quick manual selection.
- Full hex color picker available for custom colors.

---

## 12. Command Palette

- **Hotkey**: Ctrl+Shift+P (Windows) / Cmd+Shift+P (macOS)
- Searchable popup at top of screen (like VS Code / Spotlight).
- Indexes **all app actions**:
  - Create new instance / project / workspace
  - Switch to instance by name
  - Switch workspace
  - Apply layout preset
  - Change theme
  - Open settings
  - Toggle sidebar
  - Focus mode
- Fuzzy search matching.

---

## 13. Global Terminal Search

- Search across **all instance terminal output** from all instances in the current workspace.
- Results show: matching text, instance name, line context.
- Clicking a result navigates to that instance (scroll + focus + highlight) and scrolls to the matching line.
- Standard per-instance Ctrl+F search also available within each terminal.

---

## 14. Import / Export

- **Export**: Saves entire workspace configuration as a JSON file:
  - Workspaces, projects, instances (names, colors, settings, startup commands)
  - Canvas layouts, positions, groupings
  - App settings and themes
  - Does NOT export terminal history (too large, ephemeral)
- **Import**: Loads a configuration file, creating workspaces/projects/instances.
- Use case: Backup, sharing setups with team members, migrating between machines.

---

## 15. External Window Embedding

Users can drag any OS application window onto the TerminalDeck canvas, and it becomes an embedded panel.

### 15.1 How It Works

- **Drag an external window** (browser, file explorer, VS Code, Slack, etc.) onto the TerminalDeck app window.
- The external window is **captured and embedded** as a panel on the canvas.
- The embedded panel behaves like an instance: it can be **resized, snapped, grouped, and moved** on the canvas.
- The embedded application remains interactive — users can click, type, and interact with it inside the panel.

### 15.2 Visual Distinction

- Embedded panels have a **distinct visual style** from terminal instances:
  - Different title bar icon (e.g., app icon of the embedded window instead of terminal icon)
  - Subtle visual differentiator (e.g., different title bar background shade or border style)
- This ensures users can quickly distinguish terminals from embedded applications at a glance.

### 15.3 Panel Controls

- Same controls as terminal instances: minimize, close (releases the window back to the OS), drag to move.
- Indicator light shows **gray/off** (no process status tracking for embedded windows).
- Embedded panels can belong to projects and be organized in the sidebar.

### 15.4 Technical Notes

- On Windows: Uses Win32 API (`SetParent`) to reparent external windows into the Electron canvas.
- On macOS: Uses Accessibility APIs or CGWindowList to capture and embed windows.
- This is a platform-specific feature with inherent limitations — some applications may not embed cleanly (full-screen apps, DRM-protected content, etc.). The app should handle these gracefully with an error message.

---

## 16. Notification System

| Type | Behavior | Default |
|------|----------|---------|
| **Visual (toast)** | Toast popup when a task completes in an unfocused instance | Off |
| **Sound** | Audible alert on task completion | Off |
| **Sidebar badge** | Indicator light in sidebar updates in real-time | Always on |

- Both visual and sound notifications are independently toggleable in settings.
- Per-instance overrides available (e.g., enable sound only for the build instance).

---

## 17. Summary of Settings Toggles

| Setting | Default | Location |
|---------|---------|----------|
| Auto-start on login | Off | General |
| Title bar mode | Minimal | Appearance |
| Project border on instances | On | Appearance |
| Theme | System-matched | Appearance |
| Overlap mode | No overlap | Canvas |
| Zoom enabled | On | Canvas |
| Toast notifications | Off | Notifications |
| Sound notifications | Off | Notifications |
| Default shell | System default | General |

---

## 18. Implementation Strategy — Agent Decomposition

To keep each agent invocation under ~80k tokens, the implementation should be split into independent, parallelizable work units. Each agent handles one bounded module with clear inputs/outputs.

### Phase 1: Project Scaffold & Core Infrastructure (2 agents, parallel)

**Agent 1A — Electron Shell & Project Setup**
- Initialize Electron + React/TypeScript project
- Main process setup (window management, IPC channels)
- App chrome: top-level window frame, menu bar skeleton
- Build system (webpack/vite), dev tooling, hot reload
- File: `main.ts`, `preload.ts`, `package.json`, build configs

**Agent 1B — Data Layer & State Management**
- Define all data models: Workspace, Project, Instance, Group, Settings
- State management store (Zustand or Redux)
- Persistence layer: save/load state to JSON file
- Import/export logic (serialize/deserialize workspace configs)
- Files: `store/`, `models/`, `persistence/`

### Phase 2: Canvas & Layout Engine (2 agents, parallel)

**Agent 2A — Canvas Core**
- Infinite canvas with pan (click-drag, scroll)
- Zoom (Ctrl+scroll / pinch), zoom disable setting
- Canvas boundary calculation (dynamic margin beyond outermost panels)
- Panel positioning, dragging, and resize handles
- Files: `components/Canvas.tsx`, `hooks/useCanvas.ts`, `utils/geometry.ts`

**Agent 2B — Snap, Collision & Grouping**
- Magnetic snap engine (edge-to-edge snapping with configurable strength)
- Collision detection for no-overlap mode
- Overlap mode switching (no overlap / allow / warning)
- Z-order management (click to bring to front)
- Instance grouping (create/ungroup, move as unit, individual resize within group)
- Files: `engine/snap.ts`, `engine/collision.ts`, `engine/grouping.ts`

### Phase 3: Terminal Instances (2 agents, parallel)

**Agent 3A — Terminal Emulator Integration**
- xterm.js integration inside React panels
- Shell spawning (node-pty): system default shell detection, per-instance shell config
- Terminal reflow on panel resize
- Scrollback buffer management and persistence
- Working directory configuration (project-level → instance-level → home fallback)
- Files: `components/TerminalPanel.tsx`, `terminal/pty.ts`, `terminal/shell.ts`

**Agent 3B — Startup Commands & Indicator Light**
- Cascading startup command system (global → project → instance)
- Startup command execution on instance creation and app restore
- Indicator light state machine: off/gray → blue → green → yellow
- AI CLI auto-detection (process name matching: claude, chatgpt, aider, etc.)
- Manual AI instance tagging
- Files: `terminal/startup.ts`, `components/IndicatorLight.tsx`, `terminal/aiDetect.ts`

### Phase 4: UI Chrome (3 agents, parallel)

**Agent 4A — Sidebar**
- Collapsible left sidebar component
- Workspace switcher (dropdown at top)
- Project tree with indented instances
- Color dots, indicator lights in sidebar entries
- Click → scroll + focus + highlight animation
- Drag-and-drop instances between projects
- "Ungrouped" section for orphan instances
- New Instance / New Project buttons
- Files: `components/Sidebar/`

**Agent 4B — Instance Title Bar & Controls**
- Minimal title bar mode (name, project dot, indicator, minimize, close)
- Hideable title bar mode (auto-hide on mouse leave)
- Setting toggle between modes
- Minimize behavior (collapse to sidebar)
- Inline rename
- Context menu (rename, move to project, group/ungroup, settings)
- Files: `components/TitleBar.tsx`, `components/InstanceControls.tsx`

**Agent 4C — Settings Panel**
- Settings UI with categories: General, Appearance, Canvas, Notifications
- All toggles from §17 implemented with state binding
- Theme selector with system-match default
- Project color picker (auto-assign + 4-8 presets + hex picker)
- Global startup commands editor
- Shell selection dropdown
- Files: `components/Settings/`

### Phase 5: Advanced Features (3 agents, parallel)

**Agent 5A — Auto-Arrange & Layout Presets**
- Layout algorithms: grid, columns, rows, masonry
- Apply layout to current visible instances
- Save current layout as named preset
- Load/apply saved presets
- Preset management UI (rename, delete)
- Files: `engine/layout.ts`, `components/LayoutPicker.tsx`

**Agent 5B — Command Palette & Global Search**
- Command palette UI (Ctrl+Shift+P / Cmd+Shift+P)
- Fuzzy search indexing of all actions, instances, projects, workspaces
- Action execution from palette
- Global terminal output search across all instances
- Search results with instance name, line context, click-to-navigate
- Files: `components/CommandPalette.tsx`, `search/globalSearch.ts`

**Agent 5C — External Window Embedding**
- Win32 window reparenting (`SetParent` via native addon / ffi-napi)
- macOS window capture (Accessibility APIs via native addon)
- Drag-to-embed interaction (detect external window drop)
- Embedded panel component with distinct styling
- Release-on-close behavior (return window to OS)
- Error handling for non-embeddable windows
- Files: `native/windowEmbed.ts`, `components/EmbeddedPanel.tsx`

### Phase 6: Theming & Notifications (1 agent)

**Agent 6A — Theming Engine & Notifications**
- Built-in themes: dark, light, solarized (+ more)
- System theme detection and auto-switching
- Custom theme support (hex colors)
- CSS variable-based theming
- Toast notification system
- Sound notification system
- Per-instance notification overrides
- Files: `theme/`, `components/Toast.tsx`, `notifications/`

### Phase 7: Focus Mode & Polish (1 agent)

**Agent 7A — Focus Mode & Final Integration**
- Focus mode: hotkey → smooth zoom animation to single instance
- Dim/fade other instances during focus
- Esc to return to previous canvas state
- Full state restoration on app restart (orchestrate all persistence)
- Cross-cutting integration testing
- Files: `components/FocusMode.tsx`, `hooks/useFocusMode.ts`

### Agent Token Budget Estimates

| Agent | Estimated Complexity | Expected Token Usage |
|-------|---------------------|---------------------|
| 1A Scaffold | Low | ~20-30k |
| 1B Data Layer | Medium | ~30-40k |
| 2A Canvas | Medium-High | ~50-60k |
| 2B Snap/Collision | Medium-High | ~50-60k |
| 3A Terminal | High | ~60-70k |
| 3B Startup/Indicator | Medium | ~40-50k |
| 4A Sidebar | Medium | ~40-50k |
| 4B Title Bar | Low-Medium | ~30-40k |
| 4C Settings | Medium | ~40-50k |
| 5A Layouts | Medium | ~40-50k |
| 5B Palette/Search | Medium | ~40-50k |
| 5C Window Embed | High | ~60-70k |
| 6A Theming/Notifs | Medium | ~40-50k |
| 7A Focus/Polish | Medium | ~40-50k |

**Total: 14 agents across 7 phases, max 2-3 parallel per phase**

---

## 19. Documentation Structure

On implementation, create a `docs/` folder with the following structure and files. Each file should contain detailed, implementation-ready documentation.

```
docs/
├── README.md                          # Docs index — links to all sub-docs
├── architecture/
│   ├── overview.md                    # High-level architecture diagram & data flow
│   ├── electron-ipc.md                # Main ↔ Renderer IPC channel contracts
│   ├── state-management.md            # Store structure, actions, selectors
│   └── data-models.md                 # TypeScript interfaces for all entities
├── features/
│   ├── canvas.md                      # Canvas pan/zoom, boundaries, coordinate system
│   ├── snap-engine.md                 # Snap algorithm, threshold tuning, collision
│   ├── grouping.md                    # Group creation, movement, resize behavior
│   ├── terminal-integration.md        # xterm.js + node-pty setup, shell management
│   ├── startup-commands.md            # Cascade system, execution order, override logic
│   ├── indicator-light.md             # State machine, AI detection, process monitoring
│   ├── sidebar.md                     # Tree structure, drag-drop, scroll-to behavior
│   ├── focus-mode.md                  # Animation, state preservation, hotkey
│   ├── command-palette.md             # Fuzzy search, action registry, keybinding
│   ├── global-search.md              # Terminal output indexing, result navigation
│   ├── window-embedding.md            # Platform-specific APIs, limitations, fallbacks
│   ├── theming.md                     # CSS variables, theme schema, system detection
│   ├── notifications.md              # Toast system, sound, per-instance overrides
│   ├── persistence.md                 # Save/load cycle, file format, migration strategy
│   ├── import-export.md              # JSON schema, validation, version compatibility
│   └── auto-arrange.md               # Layout algorithms, preset save/load
├── ui/
│   ├── component-tree.md             # React component hierarchy
│   ├── title-bar.md                  # Minimal vs hideable modes, controls spec
│   ├── settings-panel.md             # Settings categories, toggle definitions
│   └── workspace-switcher.md         # Workspace UI, creation, deletion
├── platform/
│   ├── windows.md                    # Windows-specific: shell detection, window embedding
│   └── macos.md                      # macOS-specific: shell detection, window embedding
└── guides/
    ├── getting-started.md            # Dev setup, build, run instructions
    └── adding-a-theme.md             # How to create a custom theme
```

---

## 20. Detailed Implementation Notes

### 20.1 Electron Architecture

```
┌─────────────────────────────────────────┐
│              Main Process               │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐  │
│  │ Window   │ │ PTY      │ │ State   │  │
│  │ Manager  │ │ Manager  │ │ Persist │  │
│  └────┬─────┘ └────┬─────┘ └────┬────┘  │
│       │IPC          │IPC         │IPC    │
├───────┼─────────────┼────────────┼───────┤
│       ▼             ▼            ▼       │
│            Renderer Process              │
│  ┌────────────────────────────────────┐  │
│  │           React App                │  │
│  │  ┌──────┐ ┌────────┐ ┌─────────┐  │  │
│  │  │Canvas│ │Sidebar │ │Settings │  │  │
│  │  │  ┌───┴──┐      │ │         │  │  │
│  │  │  │Panels│      │ │         │  │  │
│  │  │  │xterm │      │ │         │  │  │
│  │  └──┴──────┘      │ │         │  │  │
│  └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Main Process responsibilities:**
- Spawn and manage PTY processes (one per terminal instance) via `node-pty`
- Persist state to disk (JSON file in app data directory)
- Handle native OS integration (window embedding, system tray, auto-start)
- Manage app lifecycle (startup, shutdown, restore)

**Renderer Process responsibilities:**
- All UI rendering (React + canvas)
- xterm.js terminal rendering (receives data from main process via IPC)
- Canvas layout engine (snap, collision, grouping — all computed in renderer)
- State management store (syncs to main process for persistence)

### 20.2 IPC Channel Contracts

| Channel | Direction | Payload | Purpose |
|---------|-----------|---------|---------|
| `pty:create` | Renderer → Main | `{ shell, cwd, env, startupCmds }` | Spawn new PTY |
| `pty:data` | Main → Renderer | `{ instanceId, data: Buffer }` | Terminal output |
| `pty:input` | Renderer → Main | `{ instanceId, data: string }` | User keystrokes |
| `pty:resize` | Renderer → Main | `{ instanceId, cols, rows }` | Terminal reflow |
| `pty:kill` | Renderer → Main | `{ instanceId }` | Terminate PTY |
| `state:save` | Renderer → Main | `{ state: AppState }` | Persist to disk |
| `state:load` | Main → Renderer | `{ state: AppState }` | Restore on startup |
| `window:embed` | Renderer → Main | `{ hwnd/pid }` | Embed external window |
| `window:release` | Renderer → Main | `{ embeddedId }` | Release embedded window |

### 20.3 Data Models (TypeScript)

```typescript
interface Workspace {
  id: string;
  name: string;
  projects: Project[];
  canvasState: CanvasState;
  layoutPresets: LayoutPreset[];
}

interface Project {
  id: string;
  name: string;
  color: string; // hex
  workingDirectory?: string; // absolute path
  startupCommands: string[];
  instances: Instance[];
}

interface Instance {
  id: string;
  name: string;
  projectId?: string; // null = ungrouped
  groupId?: string; // null = ungrouped on canvas
  position: { x: number; y: number };
  size: { width: number; height: number };
  shell?: string; // override project/global default
  workingDirectory?: string; // override project default
  startupCommands?: string[]; // override/extend project commands
  startupMode: 'extend' | 'override';
  isAiInstance: boolean; // manual tag
  isMinimized: boolean;
  scrollbackBuffer: string; // persisted terminal output
  indicatorState: 'off' | 'blue' | 'green' | 'yellow';
}

interface InstanceGroup {
  id: string;
  instanceIds: string[];
}

interface CanvasState {
  panX: number;
  panY: number;
  zoom: number; // 0.25 - 2.0
  groups: InstanceGroup[];
}

interface LayoutPreset {
  id: string;
  name: string;
  positions: { instanceId: string; x: number; y: number; w: number; h: number }[];
}

interface AppSettings {
  autoStartOnLogin: boolean;
  defaultShell: string | 'system';
  defaultWorkingDirectory: string;
  titleBarMode: 'minimal' | 'hideable';
  showProjectBorders: boolean;
  theme: string; // theme id or 'system'
  overlapMode: 'none' | 'allow' | 'warning';
  zoomEnabled: boolean;
  snapStrength: number; // 0-1
  canvasMargin: number; // px
  toastNotifications: boolean;
  soundNotifications: boolean;
  globalStartupCommands: string[];
}

interface EmbeddedPanel {
  id: string;
  projectId?: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  nativeHandle: number; // HWND on Windows, window ID on macOS
  appName: string;
  appIcon?: string; // base64 or path
  isMinimized: boolean;
}
```

### 20.4 Snap Engine Algorithm

```
For each edge of the dragged panel:
  For each edge of every other panel:
    Calculate distance between parallel edges
    If distance < SNAP_THRESHOLD (configurable, default 15px):
      Apply magnetic snap (move to align)
      
Priority: closest snap wins
Corner snaps: when both X and Y edges are within threshold, snap both
Visual feedback: show blue guide lines when snapping is active
```

**Collision detection (no-overlap mode):**
- Use AABB (Axis-Aligned Bounding Box) intersection test
- When dragging into occupied space, push the dragged panel to the nearest non-colliding position
- O(n) check against all other panels (n is small enough that spatial partitioning isn't needed)

### 20.5 Indicator Light State Machine

```
                    ┌──────────┐
        ┌──────────►│   OFF    │◄──────────┐
        │           │ (gray)   │           │
        │           └────┬─────┘           │
        │                │                 │
        │         process starts           │
        │                │                 │
        │                ▼                 │
        │           ┌──────────┐           │
   shell idle       │  BLUE    │      process
        │           │ (active) │      exits
        │           └────┬─────┘       with
        │                │            error
        │         process exits            │
        │         successfully             │
        │                │                 │
        │                ▼                 │
        │           ┌──────────┐           │
        └───────────│  GREEN   │───────────┘
                    │ (done)   │
                    └──────────┘

  AI Instance additional state:
                    ┌──────────┐
                    │  YELLOW  │
                    │(waiting) │◄── AI output contains "?" 
                    └──────────┘    or process is paused
                         │         waiting for stdin
                         ▼
                    Back to BLUE when user provides input
```

**Process monitoring approach:**
- Monitor PTY process for child process spawning/exiting
- Track stdout activity (blue while data flowing, green when process exits 0)
- For AI detection: check process name against known list + user tags
- Yellow trigger: detect when AI output stops and PTY is waiting for stdin

### 20.6 Canvas Coordinate System

```
Canvas coordinates (world space):
  Origin (0,0) = center of canvas
  Positive X = right, Positive Y = down
  
Screen coordinates:
  Transformed by: screenPos = (worldPos - panOffset) * zoom
  
Panel positions stored in world coordinates.
Pan/zoom only affects the viewport transform, not stored positions.
```

### 20.7 Persistence File Format

```json
{
  "version": 1,
  "settings": { /* AppSettings */ },
  "workspaces": [
    {
      "id": "ws-1",
      "name": "Work",
      "projects": [...],
      "canvasState": {...},
      "layoutPresets": [...]
    }
  ],
  "activeWorkspaceId": "ws-1"
}
```

- Saved to: `%APPDATA%/TerminalDeck/state.json` (Windows) / `~/Library/Application Support/TerminalDeck/state.json` (macOS)
- Auto-save: debounced, triggered on any state change (300ms debounce)
- Scrollback buffers saved separately per instance to avoid massive single file: `%APPDATA%/TerminalDeck/scrollback/{instanceId}.txt`

### 20.8 Theme Schema

```json
{
  "id": "dark-default",
  "name": "Dark",
  "colors": {
    "bg-primary": "#1a1a2e",
    "bg-secondary": "#16213e",
    "bg-canvas": "#0f0f1a",
    "text-primary": "#e0e0e0",
    "text-secondary": "#a0a0a0",
    "accent": "#4a9eff",
    "border": "#2a2a4a",
    "titlebar-bg": "#1e1e3a",
    "sidebar-bg": "#141428",
    "indicator-off": "#555",
    "indicator-blue": "#4a9eff",
    "indicator-green": "#4aff7a",
    "indicator-yellow": "#ffda4a",
    "snap-guide": "#4a9eff44",
    "terminal-bg": "#0d0d1a",
    "terminal-fg": "#d4d4d4"
  },
  "terminal": {
    "fontFamily": "Cascadia Code, Consolas, monospace",
    "fontSize": 14,
    "cursorStyle": "block"
  }
}
```

Themes applied via CSS custom properties (`--bg-primary`, etc.) for instant switching.

---

## 21. Non-Goals (Explicitly Out of Scope)

- **Broadcast input** (typing to multiple instances simultaneously) — excluded per spec discussion
- **Keyboard shortcut navigation** between instances — excluded per spec discussion
- **Split panes within instances** — replaced by instance grouping on canvas
- **Sticky notes / canvas annotations** — excluded per spec discussion
- **SSH management / remote server integration** — not in initial scope
- **Plugin/extension system** — not in initial scope
