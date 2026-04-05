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
    icon: "command" as const,
    size: "normal" as const,
  },
  {
    title: "Global Search",
    description: "Search across all terminal output from every terminal simultaneously",
    icon: "search" as const,
    size: "normal" as const,
  },
  {
    title: "Layout Presets",
    description: "One-click auto-arrange into Grid, Columns, Rows, or Cascade",
    icon: "layout-grid" as const,
    size: "wide" as const,
  },
  {
    title: "Full Persistence",
    description: "Everything restored exactly as you left it on restart",
    icon: "save" as const,
    size: "normal" as const,
  },
  {
    title: "Import / Export",
    description: "Share workspace configurations as JSON files",
    icon: "arrow-left-right" as const,
    size: "normal" as const,
  },
  {
    title: "Smart Notifications",
    description: "Visual toasts, sound alerts, and sidebar badges when tasks complete",
    icon: "bell" as const,
    size: "normal" as const,
  },
  {
    title: "Theming",
    description: "Dark mode default, system detection, or full custom colors via hex picker",
    icon: "palette" as const,
    size: "normal" as const,
  },
  {
    title: "Startup Commands",
    description:
      "3-tier cascade: Global, Project, and Instance-level auto-run commands",
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
