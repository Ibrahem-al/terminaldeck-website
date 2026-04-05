export interface TerminalLine {
  type: 'prompt' | 'output' | 'command' | 'success' | 'error' | 'ai';
  text: string;
}

export const apiServerContent: TerminalLine[] = [
  { type: 'prompt', text: '$ npm run dev' },
  { type: 'output', text: '> api-server@1.0.0 dev' },
  { type: 'output', text: '> node server.js' },
  { type: 'success', text: 'Server listening on port 3000' },
  { type: 'output', text: 'Connected to PostgreSQL ✓' },
  { type: 'output', text: '[200] GET  /api/users    12ms' },
  { type: 'output', text: '[200] POST /api/auth     45ms' },
  { type: 'output', text: '[200] GET  /api/projects  8ms' },
];

export const devServerContent: TerminalLine[] = [
  { type: 'prompt', text: '$ vite dev --port 5173' },
  { type: 'output', text: '' },
  { type: 'ai', text: '  VITE v6.0.5  ready in 342ms' },
  { type: 'output', text: '' },
  { type: 'output', text: '  ➜  Local:   http://localhost:5173/' },
  { type: 'output', text: '  ➜  Network: http://192.168.1.42:5173/' },
  { type: 'output', text: '' },
  { type: 'output', text: 'hmr update /src/App.tsx' },
  { type: 'output', text: 'hmr update /src/components/Canvas.tsx' },
];

export const claudeContent: TerminalLine[] = [
  { type: 'prompt', text: '$ claude' },
  { type: 'ai', text: '╭──────────────────────────────────╮' },
  { type: 'ai', text: '│  Claude Code         v1.0.26     │' },
  { type: 'ai', text: '╰──────────────────────────────────╯' },
  { type: 'output', text: '' },
  { type: 'ai', text: '> What would you like to work on?' },
  { type: 'output', text: '' },
  { type: 'prompt', text: 'Refactor the auth middleware to' },
  { type: 'prompt', text: 'use JWT tokens instead of sessions' },
];

export const testsContent: TerminalLine[] = [
  { type: 'prompt', text: '$ npm test' },
  { type: 'output', text: '' },
  { type: 'success', text: ' PASS  src/utils.test.ts (3 tests)' },
  { type: 'success', text: ' PASS  src/api.test.ts (7 tests)' },
  { type: 'success', text: ' PASS  src/auth.test.ts (12 tests)' },
  { type: 'output', text: '' },
  { type: 'success', text: 'Tests:  22 passed, 22 total' },
  { type: 'success', text: 'Time:   1.847s' },
];

export const redisContent: TerminalLine[] = [
  { type: 'prompt', text: '$ redis-cli' },
  { type: 'output', text: '127.0.0.1:6379> GET session:abc123' },
  { type: 'output', text: '"user_42"' },
  { type: 'output', text: '127.0.0.1:6379> KEYS user:*' },
  { type: 'output', text: '1) "user:42"' },
  { type: 'output', text: '2) "user:108"' },
  { type: 'output', text: '127.0.0.1:6379>' },
];
