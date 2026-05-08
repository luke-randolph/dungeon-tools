import { create } from 'zustand';

import {
  addClassFeatureToList,
  listClassFeatureKeys,
  removeClassFeatureFromList,
} from '@/db/queries';

interface ClassFeatureListStore {
  keys: Set<string>;
  loadedForCharacterId: number | null;

  loadFor: (characterId: number) => Promise<void>;
  addFeature: (characterId: number, featureKey: string) => Promise<void>;
  removeFeature: (characterId: number, featureKey: string) => Promise<void>;
  clear: () => void;
}

export const useClassFeatureList = create<ClassFeatureListStore>((set, get) => ({
  keys: new Set(),
  loadedForCharacterId: null,

  async loadFor(characterId) {
    if (get().loadedForCharacterId === characterId) return;
    const keys = await listClassFeatureKeys(characterId);
    set({ keys: new Set(keys), loadedForCharacterId: characterId });
  },

  async addFeature(characterId, featureKey) {
    await addClassFeatureToList(characterId, featureKey);
    set((state) => {
      const next = new Set(state.keys);
      next.add(featureKey);
      return { keys: next };
    });
  },

  async removeFeature(characterId, featureKey) {
    await removeClassFeatureFromList(characterId, featureKey);
    set((state) => {
      const next = new Set(state.keys);
      next.delete(featureKey);
      return { keys: next };
    });
  },

  clear() {
    set({ keys: new Set(), loadedForCharacterId: null });
  },
}));
