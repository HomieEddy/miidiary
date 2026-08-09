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
  addPersistedEntry: (entry: Entry) => void;
  /** Replace the whole list (hydration after wipe / app start). */
  setEntries: (entries: Entry[]) => void;
  removeEntry: (id: string) => void;
  clearAll: () => void;
}

export const useEntriesStore = create<EntriesState>((set) => ({
  entries: [],
  addPersistedEntry: (entry) =>
    set((state) => ({
      entries: [entry, ...state.entries.filter((item) => item.id !== entry.id)],
    })),
  setEntries: (entries) => set({ entries }),
  removeEntry: (id) =>
    set((state) => ({ entries: state.entries.filter((item) => item.id !== id) })),
  clearAll: () => set({ entries: [] }),
}));
