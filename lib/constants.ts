export const FEATURES = [
  {
    id: "canvas",
    title: "Infinite Spatial Canvas",
    description:
      "Every terminal is a panel on a 2D canvas you can pan and zoom. Drag terminals anywhere. Arrange them however makes sense for your workflow.",
    detail: "Pan, zoom from 25% to 200%, and arrange freely. No tabs, no rigid panes.",
  },
  {
    id: "ai-indicators",
    title: "AI-Aware Indicators",
    description:
      "Each terminal has a status indicator that auto-detects AI CLI tools like Claude, ChatGPT, Aider, and Copilot.",
    detail:
      "Gray (idle), Blue (active), Green (done), Yellow (waiting for input). Know the state of every agent at a glance.",
  },
  {
    id: "snap-guides",
    title: "Magnetic Snap Guides",
    description:
      "When you drag a terminal near another, edges snap into alignment like puzzle pieces. Clean layouts without the effort.",
    detail: "Adjustable snap strength. Encourages tidy arrangements without forcing them.",
  },
  {
    id: "projects",
    title: "Projects & Workspaces",
    description:
      "Organize terminals into a clear hierarchy: Workspaces for top-level separation, Projects with color coding and startup commands.",
    detail:
      "Each project can have a default working directory and startup commands that auto-run.",
  },
  {
    id: "focus-mode",
    title: "Focus Mode",
    description:
      "A hotkey maximizes a single terminal to fill the entire window with a smooth zoom animation, dimming everything else.",
    detail: "Press Escape to return to the full canvas. Perfect for deep work.",
  },
  {
    id: "embed",
    title: "External Window Embedding",
    description:
      "Drag any OS application window — browser, VS Code, Slack — onto the canvas as an embedded, interactive panel.",
    detail:
      "Available on both Windows (DWM thumbnail API) and macOS (native Objective-C integration).",
  },
] as const;

export const BENTO_FEATURES = [
  {
    title: "Command Palette",
    description: "Search every app action instantly with fuzzy matching",
    detail: "Press Ctrl+Shift+P (or Cmd+Shift+P on Mac) to open a searchable popup that indexes every app action. Create terminals, switch workspaces, apply layout presets, change themes, toggle sidebar, and more — all with fuzzy matching so you only need to type a few characters.",
    icon: "command" as const,
    size: "normal" as const,
  },
  {
    title: "Global Search",
    description: "Search across all terminal output from every terminal simultaneously",
    detail: "Search across all terminal output from every terminal in the current workspace at once. Results show the matching text, terminal name, and line context. Click a result to navigate directly to that terminal and scroll to the match. Never lose track of an error or log message again.",
    icon: "search" as const,
    size: "normal" as const,
  },
  {
    title: "Layout Presets",
    description: "One-click auto-arrange into Grid, Columns, Rows, or Cascade",
    detail: "Instantly organize all your terminals with one click. Choose from Grid (equal-sized tiles), Columns (vertical stacks), Rows (horizontal stacks), or Cascade (overlapping like classic Windows). You can also save your own custom layout presets and reapply them anytime across workspaces.",
    icon: "layout-grid" as const,
    size: "wide" as const,
  },
  {
    title: "Full Persistence",
    description: "Everything restored exactly as you left it on restart",
    detail: "On app restart, everything is restored exactly as you left it — all workspaces, projects, terminals, names, colors, and settings. Canvas positions, sizes, zoom level, and groupings are preserved. Terminal scrollback history is saved, and startup commands re-run to restore shell environments.",
    icon: "save" as const,
    size: "normal" as const,
  },
  {
    title: "Import / Export",
    description: "Share workspace configurations as JSON files",
    detail: "Export entire workspace configurations as JSON files for backup, sharing with teammates, or migrating between machines. Import configurations to instantly set up a workspace with all projects, terminals, positions, and startup commands pre-configured. Great for team onboarding.",
    icon: "arrow-left-right" as const,
    size: "normal" as const,
  },
  {
    title: "Smart Notifications",
    description: "Visual toasts, sound alerts, and sidebar badges when tasks complete",
    detail: "Get notified when tasks complete in unfocused terminals. Visual toast notifications pop up, optional sound alerts play, and sidebar badges update in real-time. All independently toggleable with per-terminal overrides — so you can mute noisy terminals and keep alerts on critical ones.",
    icon: "bell" as const,
    size: "normal" as const,
  },
  {
    title: "Theming",
    description: "Dark mode default, system detection, or full custom colors via hex picker",
    detail: "Ships with Dark mode as the default, plus Solarized Dark, Solarized Light, and a clean Light theme. Follows your system's light/dark mode preference automatically. For full control, customize every color via hex picker — background, accent, text, borders, terminal colors, and more through CSS custom properties.",
    icon: "palette" as const,
    size: "normal" as const,
  },
  {
    title: "Startup Commands",
    description:
      "3-tier override: Global, Project, and Instance-level auto-run commands",
    detail: "Automate terminal setup with a 3-tier command system where each level overrides the one above. Global commands are the default for every new terminal (e.g., source ~/.bashrc). If a Project defines its own startup commands (e.g., cd ~/projects/server && source .env), those run instead of the global ones. If an Instance has its own commands (e.g., npm run dev), those take priority over both project and global. The most specific level always wins — no duplicate or conflicting commands.",
    icon: "terminal" as const,
    size: "wide" as const,
  },
] as const;

export const COMPARISON_DATA = {
  features: [
    "Spatial canvas",
    "Free-form arrangement",
    "AI status indicators",
    "External window embedding",
    "Project organization",
    "Layout presets",
    "Snap guides",
    "Cross-platform",
  ],
  competitors: [
    {
      name: "TerminalDeck",
      highlight: true,
      values: [true, true, true, true, true, true, true, true],
    },
    {
      name: "iTerm2",
      highlight: false,
      values: [false, false, false, false, false, false, false, false],
    },
    {
      name: "Windows Terminal",
      highlight: false,
      values: [false, false, false, false, false, false, false, false],
    },
    {
      name: "Hyper",
      highlight: false,
      values: [false, false, false, false, false, false, true, false],
    },
    {
      name: "Warp",
      highlight: false,
      values: [false, false, "partial", false, false, false, false, false],
    },
  ],
} as const;

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Compare", href: "#compare" },
  { label: "Download", href: "#download" },
] as const;
