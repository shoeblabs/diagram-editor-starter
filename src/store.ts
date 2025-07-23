import { create } from 'zustand';

export interface LabelData {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fill: string;
}

interface State {
  bgSrc: string | null;
  labels: LabelData[];
  selected: string | null;
  setBg: (src: string) => void;
  addLabel: () => void;
  updateLabel: (id: string, patch: Partial<LabelData>) => void;
  bulkReplace: (map: Record<string, string>) => void;
  select: (id: string | null) => void;
}

export const useStore = create<State>((set, get) => ({
  bgSrc: null,
  labels: [],
  selected: null,
  setBg: (src) => set({ bgSrc: src }),
  addLabel: () =>
    set((s) => ({
      labels: [
        ...s.labels,
        {
          id: crypto.randomUUID(),
          text: `label${s.labels.length + 1}`,
          x: 200,
          y: 200,
          fontSize: 24,
          fill: '#e60045',
        },
      ],
    })),
  updateLabel: (id, patch) =>
    set((s) => ({
      labels: s.labels.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    })),
  bulkReplace: (map) =>
    set((s) => ({
      labels: s.labels.map((l) =>
        map[l.text] ? { ...l, text: map[l.text] } : l,
      ),
    })),
  select: (id) => set({ selected: id }),
}));