# Getting Started

## Prerequisites

- **Node.js** 18+ and npm
- **Windows:** Visual C++ Build Tools (required for `node-pty` native compilation). Install via `npm install --global windows-build-tools` or install Visual Studio Build Tools manually.
- **macOS:** Xcode Command Line Tools (`xcode-select --install`)
- **Linux:** `build-essential` package (`sudo apt install build-essential`)

## Install

```bash
cd claude_deck_v4
npm install
```

`node-pty` requires native compilation. If `npm install` fails with build errors, ensure you have the C++ build tools installed for your platform.

## Development

Development requires **two terminal processes** running simultaneously:

### Terminal 1: Vite Dev Server (renderer hot-reload)

```bash
npm run dev
```

Starts the Vite dev server at `http://localhost:5173`. This serves the renderer process with hot module replacement.

### Terminal 2: Electron Main Process

```bash
npm run dev:electron
```

This compiles the main process TypeScript (`tsc -p tsconfig.main.json`) and then launches Electron, which loads the renderer from the Vite dev server.

**Workflow:** Make changes to renderer code (React components, hooks, etc.) and see them hot-reload. For main process changes (PTY, persistence, window embedding), restart the Electron process.

## Build

```bash
npm run build
```

Compiles the main process TypeScript and builds the Vite renderer bundle. Output goes to `dist/`.

## Package

```bash
npm run package
```

Runs `build` then `electron-builder` to create a distributable package.

## Start (production)

```bash
npm start
```

Runs the compiled Electron app from `dist/main/main.js`.

## Project Structure

```
claude_deck_v4/
  src/
    shared/           # Types and utils shared between main and renderer
      types.ts        # All TypeScript interfaces
      utils.ts        # ID generation, default factories, color palette
    main/             # Electron main process
      main.ts         # Entry point, window creation, IPC registration
      preload.ts      # Context bridge (window.terminalDeck API)
      persistence.ts  # State save/load to disk
      importExport.ts # Workspace import/export
      pty/
        ptyManager.ts     # node-pty instance management
        ptyIpc.ts         # PTY IPC handlers
        shellDetect.ts    # Default shell detection
        startupCommands.ts # Startup command cascade and execution
      native/
        windowEmbed.ts    # Win32 window embedding via PowerShell
    renderer/         # Electron renderer process (React app)
      main.tsx        # React entry point
      App.tsx         # Root component
      store/
        index.ts          # Main Zustand store
        outputBuffer.ts   # Terminal output buffer for search
      stores/
        snapGuidesStore.ts # Transient snap guide state
      hooks/              # Custom React hooks
      engine/             # Pure computation functions
      components/         # React components
      theme/              # Theme definitions and provider
      utils/              # Utility functions
      styles/             # Global CSS
  docs/               # Documentation
  dist/               # Build output
  package.json
  tsconfig.json       # Base TS config (references main + renderer)
  tsconfig.main.json  # Main process TS config (CommonJS, Node)
  tsconfig.renderer.json # Renderer TS config (ESNext, DOM, JSX)
  vite.config.ts      # Vite configuration
```

## TypeScript Configuration

The project uses a composite TypeScript setup:

- **`tsconfig.json`** -- Base config with references to main and renderer
- **`tsconfig.main.json`** -- Main process: CommonJS modules, Node module resolution, includes `src/main/` and `src/shared/`
- **`tsconfig.renderer.json`** -- Renderer: ESNext modules, bundler resolution, JSX support, includes `src/renderer/` and `src/shared/`

Both target ES2022 with strict mode enabled.

## Vite Configuration

- Root: `src/renderer/`
- Output: `dist/renderer/`
- Base: `./` (relative paths for Electron file:// loading)
- Alias: `@shared` -> `src/shared/`
- Dev server port: 5173

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.3 | UI framework |
| `react-dom` | ^18.3 | React DOM renderer |
| `xterm` | ^5.3 | Terminal emulator UI |
| `xterm-addon-fit` | ^0.8 | Auto-fit terminal to container |
| `node-pty` | ^1.0 | Pseudo-terminal backend |
| `zustand` | ^5.0 | State management |
| `immer` | ^10.1 | Immutable state updates |
| `electron` | ^33.0 | Desktop runtime |
| `vite` | ^6.0 | Bundler and dev server |
| `@vitejs/plugin-react` | ^4.3 | React support for Vite |
| `electron-builder` | ^25.0 | Packaging |

## Common Issues

### node-pty build fails
Ensure you have C++ build tools installed. On Windows, run `npm install --global windows-build-tools` from an elevated terminal, or install Visual Studio Build Tools with the "Desktop development with C++" workload.

### Vite dev server port conflict
If port 5173 is in use, change it in `vite.config.ts` and update the URL in `src/main/main.ts` line 37.

### Electron doesn't load the renderer
Make sure the Vite dev server is running first (`npm run dev`) before starting Electron (`npm run dev:electron`).

### PowerShell window embedding fails
Window embedding requires PowerShell and .NET Framework. If the PSHost initialization times out (15 seconds), check that `powershell.exe` is available in PATH and that execution policy allows running scripts.

### React StrictMode double-mount
In development, React StrictMode causes components to mount twice. The PTY manager handles this gracefully -- if a PTY with the same ID already exists, it kills the old one before spawning a new one.
