# TerminalDeck Documentation

**TerminalDeck** is a spatial canvas of terminal instances built with Electron + React + TypeScript + Zustand. It lets users arrange multiple terminal panels on an infinite pannable/zoomable canvas, group them into projects, and embed external OS windows alongside terminals.

## Documentation Index

### Architecture
- [Overview](architecture/overview.md) -- High-level architecture, process model, data flow, component hierarchy
- [Data Models](architecture/data-models.md) -- All TypeScript interfaces and their relationships
- [State Management](architecture/state-management.md) -- Zustand store structure, actions, persistence
- [IPC Channels](architecture/ipc-channels.md) -- Every IPC channel between main and renderer processes

### Features
- [Canvas](features/canvas.md) -- Infinite canvas with pan, zoom, and CSS transforms
- [Snap Engine](features/snap-engine.md) -- Snap alignment, collision detection, drag behavior
- [Terminal Integration](features/terminal-integration.md) -- xterm.js + node-pty setup and lifecycle
- [Startup Commands](features/startup-commands.md) -- Global/project/instance command cascade
- [Indicator Lights](features/indicator-lights.md) -- Terminal status indicator state machine
- [Sidebar](features/sidebar.md) -- Project tree, workspace switcher, drag-and-drop
- [Window Embedding](features/window-embedding.md) -- Win32 SetParent approach for embedding external windows
- [Settings](features/settings.md) -- Global, project, and instance settings dialogs
- [Layouts](features/layouts.md) -- Auto-arrange algorithms and saved presets
- [Focus Mode](features/focus-mode.md) -- Single-panel focus with zoom animation
- [Command Palette](features/command-palette.md) -- Quick-access command launcher
- [Global Search](features/global-search.md) -- Cross-workspace search overlay
- [Notifications](features/notifications.md) -- In-app notification system
- [Import / Export](features/import-export.md) -- Workspace and settings import/export
- [Keyboard Shortcuts](features/keyboard-shortcuts.md) -- Global hotkeys and configurable bindings
- [Theming](features/theming.md) -- CSS custom properties theme system
- [Persistence](features/persistence.md) -- State save/load via Electron IPC
- [Custom Title Bar](features/custom-titlebar.md) -- Frameless window with custom chrome

### UI
- [Component Tree](ui/component-tree.md) -- Complete React component hierarchy and props

### Guides
- [Getting Started](guides/getting-started.md) -- Developer setup, build, and common issues

### Spec
- [SPEC.md](SPEC.md) -- Original product specification (do not modify)
