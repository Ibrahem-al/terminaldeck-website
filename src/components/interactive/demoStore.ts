import { create } from 'zustand';

export interface DemoPanelData {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  indicatorState: 'off' | 'blue' | 'green' | 'yellow';
  projectColor: string;
  content: string[];  // simplified terminal lines
}

interface DemoState {
  panels: DemoPanelData[];
  focusedId: string | null;
  isFocusMode: boolean;
  setPosition: (id: string, x: number, y: number) => void;
  setFocused: (id: string | null) => void;
  enterFocusMode: (id: string) => void;
  exitFocusMode: () => void;
  resetLayout: () => void;
}

const initialPanels: DemoPanelData[] = [
  { id: '1', name: 'Backend API', x: 20, y: 20, width: 280, height: 200, indicatorState: 'green', projectColor: '#22c55e', content: ['$ npm run dev', '> server@1.0 dev', 'Listening on :3000', '[200] GET /api/users'] },
  { id: '2', name: 'Frontend', x: 320, y: 30, width: 280, height: 200, indicatorState: 'blue', projectColor: '#3b82f6', content: ['$ vite dev', 'VITE v6.0 ready', '\u27a8 localhost:5173', 'hmr update App.tsx'] },
  { id: '3', name: 'Claude AI', x: 40, y: 250, width: 280, height: 200, indicatorState: 'yellow', projectColor: '#8b5cf6', content: ['$ claude', '> What to work on?', '', '\u258c'] },
  { id: '4', name: 'Tests', x: 350, y: 270, width: 260, height: 180, indicatorState: 'off', projectColor: '#f59e0b', content: ['$ npm test', 'PASS utils.test.ts', 'PASS api.test.ts', '22 passed'] },
];

export const useDemoStore = create<DemoState>((set) => ({
  panels: initialPanels,
  focusedId: null,
  isFocusMode: false,
  setPosition: (id, x, y) =>
    set((s) => ({
      panels: s.panels.map((p) => (p.id === id ? { ...p, x, y } : p)),
    })),
  setFocused: (id) => set({ focusedId: id }),
  enterFocusMode: (id) => set({ focusedId: id, isFocusMode: true }),
  exitFocusMode: () => set({ isFocusMode: false }),
  resetLayout: () => set({ panels: initialPanels, focusedId: null, isFocusMode: false }),
}));
