import * as Crypto from 'expo-crypto';
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
  addPersistedEntry: (entry: Entry) => void;
  getLatestEntry: () => Entry | undefined;
  clearAll: () => void;
}

export const useEntriesStore = create<EntriesState>((set, get) => ({
  entries: [],
  addEntry: (entry) =>
    set((state) => ({
      entries: [
        { ...entry, id: `entry-${Crypto.randomUUID()}` },
        ...state.entries,
      ],
    })),
  addPersistedEntry: (entry) =>
    set((state) => ({
      entries: [entry, ...state.entries.filter((item) => item.id !== entry.id)],
    })),
  getLatestEntry: () => get().entries[0],
  clearAll: () => set({ entries: [] }),
}));
