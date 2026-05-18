import { create } from 'zustand';

export type EntryCategory = 'diary' | 'task' | 'note';

export interface Entry {
  id: string;
  text: string;
  category: EntryCategory;
  createdAt: string;
}

interface EntriesState {
  entries: Entry[];
  addEntry: (entry: Omit<Entry, 'id'>) => void;
  getLatestEntry: () => Entry | undefined;
  clearAll: () => void;
}

export const useEntriesStore = create<EntriesState>((set, get) => ({
  entries: [],
  addEntry: (entry) =>
    set((state) => ({
      entries: [
        { ...entry, id: `entry-${crypto.randomUUID()}` },
        ...state.entries,
      ],
    })),
  getLatestEntry: () => get().entries[0],
  clearAll: () => set({ entries: [] }),
}));
