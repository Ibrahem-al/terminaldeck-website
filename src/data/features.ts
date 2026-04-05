export interface Feature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
}

export const features: Feature[] = [
  {
    id: 'canvas',
    title: 'Infinite Canvas',
    subtitle: 'Spatial freedom for your terminals',
    description:
      'Arrange terminal instances anywhere on a pannable, zoomable 2D canvas. No more tabs or rigid pane splits — just drag, drop, and organize the way your brain works.',
    icon: '⊞',
  },
  {
    id: 'snap',
    title: 'Magnetic Snap Engine',
    subtitle: 'Intelligent alignment that feels right',
    description:
      'Panels magnetically snap to edges with visual guide lines. Collision detection prevents overlap, and cascade-push handles complex rearrangements automatically.',
    icon: '⊟',
  },
  {
    id: 'indicators',
    title: 'AI Indicator Lights',
    subtitle: 'Know what every terminal is doing',
    description:
      'Five-state status lights auto-detect AI CLIs like Claude, ChatGPT, and Copilot. See at a glance which processes are running, waiting, or complete.',
    icon: '◉',
  },
  {
    id: 'embedding',
    title: 'Window Embedding',
    subtitle: 'Embed any app alongside your terminals',
    description:
      'Pull external windows — browsers, editors, monitoring tools — directly onto the canvas. Zero-copy GPU compositing on Windows, native capture on macOS.',
    icon: '⧉',
  },
  {
    id: 'focus',
    title: 'Focus Mode',
    subtitle: 'Deep work, one keypress away',
    description:
      'Press F11 and the active terminal zooms to fill the viewport. Everything else dims to 30% opacity. Press again to return to your spatial layout instantly.',
    icon: '◎',
  },
  {
    id: 'themes',
    title: '4 Built-in Themes',
    subtitle: 'Your canvas, your aesthetic',
    description:
      'Dark, Light, Solarized Dark, and Solarized Light ship out of the box. Auto-detect your OS preference or switch manually. Every pixel respects your choice.',
    icon: '◐',
  },
];
