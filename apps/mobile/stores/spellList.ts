import { create } from 'zustand';

import {
  addSpellToList,
  listSpellListKeys,
  removeSpellFromList,
} from '@/db/queries';

interface SpellListStore {
  keys: Set<string>;
  loadedForCharacterId: number | null;

  loadFor: (characterId: number) => Promise<void>;
  addSpell: (characterId: number, spellKey: string) => Promise<void>;
  removeSpell: (characterId: number, spellKey: string) => Promise<void>;
  clear: () => void;
}

export const useSpellList = create<SpellListStore>((set, get) => ({
  keys: new Set(),
  loadedForCharacterId: null,

  async loadFor(characterId) {
    if (get().loadedForCharacterId === characterId) return;
    const keys = await listSpellListKeys(characterId);
    set({ keys: new Set(keys), loadedForCharacterId: characterId });
  },

  async addSpell(characterId, spellKey) {
    await addSpellToList(characterId, spellKey);
    set((state) => {
      const next = new Set(state.keys);
      next.add(spellKey);
      return { keys: next };
    });
  },

  async removeSpell(characterId, spellKey) {
    await removeSpellFromList(characterId, spellKey);
    set((state) => {
      const next = new Set(state.keys);
      next.delete(spellKey);
      return { keys: next };
    });
  },

  clear() {
    set({ keys: new Set(), loadedForCharacterId: null });
  },
}));
