import type { Character } from '@dungeon-tools/shared';
import { create } from 'zustand';
import {
  createCharacter as dbCreateCharacter,
  deleteCharacter as dbDeleteCharacter,
  updateCharacter as dbUpdateCharacter,
  getActiveCharacterId,
  getCharacter,
  listCharacters,
  setActiveCharacterId,
  type CharacterInput,
} from '@/db/queries';

interface CharactersStore {
  character: Character | null;
  characters: Character[];
  loaded: boolean;

  refresh: () => Promise<void>;
  setActive: (id: number | null) => Promise<void>;
  addCharacter: (input: CharacterInput) => Promise<Character>;
  updateCharacter: (id: number, input: CharacterInput) => Promise<void>;
  removeCharacter: (id: number) => Promise<void>;
}

export const useCharacters = create<CharactersStore>((set, get) => ({
  character: null,
  characters: [],
  loaded: false,

  async refresh() {
    const all = await listCharacters();
    const storedId = await getActiveCharacterId();
    let active =
      storedId != null ? (all.find((c) => c.id === storedId) ?? null) : null;

    if (!active && all.length > 0) {
      active = all[0];
      await setActiveCharacterId(active.id);
    } else if (!active && storedId != null) {
      await setActiveCharacterId(null);
    }

    set({ characters: all, character: active, loaded: true });
  },

  async setActive(id) {
    await setActiveCharacterId(id);
    if (id == null) {
      set({ character: null });
      return;
    }
    const ch = await getCharacter(id);
    set({ character: ch });
  },

  async addCharacter(input) {
    const ch = await dbCreateCharacter(input);
    await setActiveCharacterId(ch.id);
    set((state) => ({
      characters: [...state.characters, ch],
      character: ch,
    }));
    return ch;
  },

  async updateCharacter(id, input) {
    await dbUpdateCharacter(id, input);
    const updated = await getCharacter(id);
    set((state) => ({
      characters: state.characters.map((c) =>
        c.id === id ? (updated ?? c) : c,
      ),
      character: state.character?.id === id ? updated : state.character,
    }));
  },

  async removeCharacter(id) {
    await dbDeleteCharacter(id);
    const remaining = get().characters.filter((c) => c.id !== id);
    const wasActive = get().character?.id === id;

    if (wasActive) {
      const next = remaining[0] ?? null;
      await setActiveCharacterId(next?.id ?? null);
      set({ characters: remaining, character: next });
    } else {
      set({ characters: remaining });
    }
  },
}));
