import { create } from 'zustand';

import {
  addRacialTraitPick,
  listRacialTraitPickKeys,
  removeRacialTraitPick,
} from '@/db/queries';

interface RacialTraitPicksStore {
  keys: Set<string>;
  loadedForCharacterId: number | null;

  loadFor: (characterId: number) => Promise<void>;
  addPick: (characterId: number, traitKey: string) => Promise<void>;
  removePick: (characterId: number, traitKey: string) => Promise<void>;
  clear: () => void;
}

export const useRacialTraitPicks = create<RacialTraitPicksStore>(
  (set, get) => ({
    keys: new Set(),
    loadedForCharacterId: null,

    async loadFor(characterId) {
      if (get().loadedForCharacterId === characterId) return;
      const keys = await listRacialTraitPickKeys(characterId);
      set({ keys: new Set(keys), loadedForCharacterId: characterId });
    },

    async addPick(characterId, traitKey) {
      await addRacialTraitPick(characterId, traitKey);
      set((state) => {
        const next = new Set(state.keys);
        next.add(traitKey);
        return { keys: next };
      });
    },

    async removePick(characterId, traitKey) {
      await removeRacialTraitPick(characterId, traitKey);
      set((state) => {
        const next = new Set(state.keys);
        next.delete(traitKey);
        return { keys: next };
      });
    },

    clear() {
      set({ keys: new Set(), loadedForCharacterId: null });
    },
  }),
);
