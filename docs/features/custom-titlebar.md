# Custom Title Bar

TerminalDeck uses a frameless Electron window (`frame: false`) with a custom 28px title bar.

## Electron Window Configuration

In `src/main/main.ts`:

```typescript
mainWindow = new BrowserWindow({
  frame: false,
  titleBarStyle: 'hidden',
  titleBarOverlay: false,
  backgroundColor: '#0f0f1a',
  // ...
});
```

## AppTitleBar Component (`src/renderer/components/AppTitleBar.tsx`)

### Layout

```
+---+----------------------------+---+---+---+
| < |      TerminalDeck          | _ | [] | X |
+---+----------------------------+---+---+---+
 28px height
```

- **Left:** Sidebar toggle button (chevron left/right)
- **Center:** App title "TerminalDeck" (centered, pointer-events: none)
- **Right:** Window controls (minimize, maximize/restore, close)

### Drag Region

The entire title bar has `WebkitAppRegion: 'drag'`, making it draggable for window movement. The buttons have `WebkitAppRegion: 'no-drag'` to be clickable.

### Window Controls

| Button | Action | Hover Style |
|--------|--------|-------------|
| Minimize (---) | `window.terminalDeck.windowMinimize()` | Gray background |
| Maximize/Restore | `window.terminalDeck.windowMaximize()` | Gray background |
| Close (X) | `window.terminalDeck.windowClose()` | Red (#e81123) background, white text |

The maximize button shows a different icon based on state:
- Not maximized: square outline (U+25A1)
- Maximized: overlapping squares (U+29C9)

### Maximized State Detection

The component polls `window.terminalDeck.windowIsMaximized()` every 1 second to detect maximize/restore events that don't propagate to the renderer reliably.

### IPC Handlers

In `src/main/main.ts`:
- `window:minimize` -- `mainWindow.minimize()` (send/on)
- `window:maximize` -- Toggles between `maximize()` and `unmaximize()` (send/on)
- `window:close` -- `mainWindow.close()` (send/on)
- `window:isMaximized` -- Returns `mainWindow.isMaximized()` (invoke/handle)

### Sidebar Toggle

The leftmost button toggles sidebar visibility. Shows a left-pointing chevron when sidebar is visible, right-pointing when hidden.

### Styling

- Height: 28px (constant `TITLE_BAR_HEIGHT`)
- Background: `#0d0d1a`
- Bottom border: `1px solid rgba(255,255,255,0.04)`
- Z-index: 10000
- Button width: 46px (window controls), 36px (sidebar toggle)
- Title font: 11px, weight 500, color #555, letter-spacing 0.5px

## Panel Title Bar (`src/renderer/components/TitleBar/TitleBar.tsx`)

Each canvas panel also has its own title bar (distinct from the app title bar). See [Snap Engine](snap-engine.md) for drag integration details.

### Height: 38px

### Two modes controlled by `settings.titleBarMode`:
- **`'minimal'`** -- Always visible
- **`'hideable'`** -- Auto-hides, appears on mouse hover over the panel

### Contents:
- Indicator light (8px colored circle)
- Instance name (double-click to inline rename)
- Project badge (colored dot + project name, if assigned to a project)
- Minimize button
- Close button (releases native window for embedded instances)

### Context menu (right-click):
- Settings...
- Rename
- Move to Project (submenu with all projects + "None")
- Mark/Unmark as AI Instance
- Minimize
- Close

The context menu is rendered via `ContextMenu` component which supports one level of submenus.
