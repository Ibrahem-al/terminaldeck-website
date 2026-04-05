# Theme System

The theme system uses CSS custom properties applied to `document.documentElement`. Defined in `src/renderer/theme/themes.ts` and applied by `src/renderer/theme/ThemeProvider.tsx`.

## Built-in Themes

| ID | Name | Background | Accent |
|----|------|-----------|--------|
| `dark` | Dark | #0f0f1a | #4a9eff |
| `light` | Light | #f5f5f5 | #2563eb |
| `solarized` | Solarized Dark | #002b36 | #268bd2 |
| `solarized-light` | Solarized Light | #fdf6e3 | #268bd2 |

## Theme Definition

```typescript
interface ThemeDefinition {
  id: string;
  name: string;
  colors: {
    'bg-primary': string;      // Main background
    'bg-secondary': string;    // Secondary background
    'bg-canvas': string;       // Canvas background
    'bg-panel': string;        // Panel/card background
    'text-primary': string;    // Primary text
    'text-secondary': string;  // Secondary/muted text
    'accent': string;          // Accent color (buttons, highlights)
    'border': string;          // Border color
    'titlebar-bg': string;     // Panel title bar background
    'sidebar-bg': string;      // Sidebar background
    'indicator-off': string;   // Indicator light off state
    'indicator-blue': string;  // Indicator light active state
    'indicator-green': string; // Indicator light completed state
    'indicator-yellow': string;// Indicator light waiting state
    'snap-guide': string;      // Snap guide line color
    'terminal-bg': string;     // Terminal background
    'terminal-fg': string;     // Terminal foreground text
  };
  terminal: {
    fontFamily: string;        // Terminal font stack
    fontSize: number;          // Terminal font size
    cursorStyle: 'block' | 'bar' | 'underline';
  };
}
```

## CSS Custom Properties

Theme colors are applied as CSS custom properties on the root element:

```css
:root {
  --bg-primary: #0f0f1a;
  --bg-secondary: #16162a;
  --bg-canvas: #0f0f1a;
  --bg-panel: #1a1a2e;
  --text-primary: #e0e0e0;
  /* ... etc */
  --terminal-font-family: 'Cascadia Code', ...;
  --terminal-font-size: 14px;
}
```

Components reference these with `var(--bg-canvas, fallback)` syntax.

## System Theme Auto-Detection

The `ThemeProvider` listens for OS theme changes using `window.matchMedia('(prefers-color-scheme: dark)')`:

```typescript
const mql = window.matchMedia('(prefers-color-scheme: dark)');
mql.addEventListener('change', handler);
```

When `theme` is set to `'system'`, the resolved theme follows the OS preference (dark theme if `prefers-color-scheme: dark`, light theme otherwise).

## Theme Resolution

`resolveTheme(themeId, prefersDark)`:
- If `themeId === 'system'`: returns `darkTheme` or `lightTheme` based on `prefersDark`
- Otherwise: looks up `themes[themeId]`, falling back to `darkTheme` if not found

## ThemeProvider Component

Wraps the entire app (in `src/renderer/main.tsx`). On mount and whenever `themeSetting` or `prefersDark` changes, it:

1. Resolves the theme via `resolveTheme()`
2. Calls `applyTheme()` which iterates over `theme.colors` and sets CSS custom properties on `document.documentElement`

The provider renders no UI of its own -- just `<>{children}</>`.

## Usage in Components

Components typically use inline styles with CSS variable references:

```typescript
style={{ background: 'var(--bg-canvas, #0f0f1a)' }}
style={{ color: 'var(--text-primary, #e0e0e0)' }}
```

The fallback value after the comma ensures the component looks reasonable even before the theme is applied.

Light mode is now fully supported. ~25 component files were updated to replace hardcoded hex colors with CSS variable references (`var(--text-primary)`, `var(--text-secondary)`, `var(--bg-panel)`, `var(--border)`, `var(--accent)`, etc.), ensuring proper contrast across all UI components in both light and dark themes.

Components updated: Sidebar.tsx, LayoutPicker.tsx, ToggleSwitch.tsx, ProjectItem.tsx, ConfirmDialog.tsx, NewProjectDialog.tsx, SettingsPanel.tsx, DeleteProjectDialog.tsx, DirectoryPicker.tsx, InstanceSettingsDialog.tsx, ProjectSettingsDialog.tsx, SelectControl.tsx, CanvasTab.tsx, StartupTab.tsx, SettingRow.tsx, AppearanceTab.tsx, GeneralTab.tsx, NotificationsTab.tsx, SliderControl.tsx, AppTitleBar.tsx, InstanceItem.tsx, WorkspaceSwitcher.tsx, CommandPalette.tsx, GlobalSearch.tsx, TitleBar.tsx, ContextMenu.tsx, CanvasPanel.tsx, EmbeddedPanelContent.tsx.
