export interface FAQItem {
  question: string;
  answer: string;
}

export const faqItems: FAQItem[] = [
  {
    question: 'What is TerminalDeck?',
    answer:
      'TerminalDeck is a spatial canvas-based terminal application. Instead of tabs or split panes, you arrange terminal instances freely on an infinite 2D canvas with intelligent snapping, project grouping, and AI-aware status indicators.',
  },
  {
    question: 'Which platforms are supported?',
    answer:
      'TerminalDeck runs natively on Windows and macOS. It is built on Electron with a React frontend and node-pty backend for full terminal emulation on both platforms.',
  },
  {
    question: 'Is TerminalDeck free?',
    answer:
      'Yes — TerminalDeck is completely free during early access. Download it now and start organizing your terminal workflow. We may introduce premium tiers in the future, but the core experience will always be powerful.',
  },
  {
    question: 'How is this different from iTerm2 or Windows Terminal?',
    answer:
      'Traditional terminal apps use tabs and pane splits. TerminalDeck gives you a spatial canvas — arrange terminals anywhere, snap them together magnetically, group them by project with color coding, and see AI status at a glance. Think of it as a whiteboard for your terminals.',
  },
  {
    question: 'Can I embed other applications?',
    answer:
      'Yes. On Windows, TerminalDeck uses DWM Thumbnails for zero-copy GPU-composited embedding of any window. On macOS, it captures windows via native APIs. Embed browsers, editors, or monitoring dashboards right alongside your terminals.',
  },
  {
    question: 'What are the AI indicator lights?',
    answer:
      'Each terminal has a colored status light: gray (idle), blue pulsing (active output), green (task complete), yellow (AI waiting for input), and orange (embedded window). TerminalDeck auto-detects AI CLIs like Claude, ChatGPT, Aider, and Copilot.',
  },
  {
    question: 'Can I save and restore my layouts?',
    answer:
      'Absolutely. TerminalDeck auto-saves your entire workspace — panel positions, sizes, projects, and settings. On restart, everything is restored exactly as you left it. You can also save named layout presets and export/import configurations.',
  },
];
