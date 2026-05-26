import type { ClassFeature } from '@dungeon-tools/shared';
import {
  getChildren,
  getParent,
  isParent,
  resolveMaxPicks,
} from '@dungeon-tools/shared';
import { useRouter } from 'expo-router';

import { ALL_CLASS_FEATURES } from '@/data/classFeatures';
import { useCharacters } from '@/stores/characters';
import { useClassFeatureList } from '@/stores/classFeatureList';
import { showAlert, showConfirm } from '@/utils/dialogs';
import { scalingChainKeys } from '@/utils/featureDisplay';

export function useToggleClassFeature() {
  const router = useRouter();
  const character = useCharacters((s) => s.character);
  const keys = useClassFeatureList((s) => s.keys);
  const addFeature = useClassFeatureList((s) => s.addFeature);
  const removeFeature = useClassFeatureList((s) => s.removeFeature);

  return function toggle(feature: ClassFeature) {
    if (!character) {
      showConfirm(
        'Create a character first',
        "Class features are added to a specific character's list.",
        {
          confirmLabel: 'Create one',
          onConfirm: () => router.push('/characters/new'),
        },
      );
      return;
    }

    // Parents anchor a group and aren't selectable themselves.
    if (isParent(feature)) {
      showAlert(feature.name, 'Pick one of the options below.');
      return;
    }

    // For scaling chains, in/out is across the whole chain — un-toggling
    // clears stale tiers as a side effect.
    const chainKeys = scalingChainKeys(feature);
    const starredChainKeys = chainKeys.filter((k) => keys.has(k));
    if (starredChainKeys.length > 0) {
      for (const k of starredChainKeys) {
        removeFeature(character.id, k);
      }
      return;
    }

    if (character.level < feature.level) {
      showAlert(
        `Requires level ${feature.level}`,
        `${character.name} is level ${character.level}. ${feature.name} unlocks at level ${feature.level}.`,
      );
      return;
    }

    const parent = getParent(feature, ALL_CLASS_FEATURES);
    if (parent) {
      const maxPicks = resolveMaxPicks(
        parent,
        character.level,
        ALL_CLASS_FEATURES,
      );
      const selectedSiblings = getChildren(parent, ALL_CLASS_FEATURES).filter(
        (s) => keys.has(s.key),
      );

      if (maxPicks === 1) {
        for (const s of selectedSiblings) {
          removeFeature(character.id, s.key);
        }
      } else if (selectedSiblings.length >= maxPicks) {
        showAlert(
          `${parent.name} — limit reached`,
          `You've already selected ${maxPicks}. Remove one first.`,
        );
        return;
      }
    }

    addFeature(character.id, feature.key);
  };
}
