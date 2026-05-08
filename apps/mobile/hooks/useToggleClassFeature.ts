import type { ClassFeature } from '@dungeon-tools/shared';
import { useRouter } from 'expo-router';

import { useCharacters } from '@/stores/characters';
import { useClassFeatureList } from '@/stores/classFeatureList';
import { showAlert, showConfirm } from '@/utils/dialogs';

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

    if (keys.has(feature.key)) {
      removeFeature(character.id, feature.key);
      return;
    }

    if (character.level < feature.level) {
      showAlert(
        `Requires level ${feature.level}`,
        `${character.name} is level ${character.level}. ${feature.name} unlocks at level ${feature.level}.`,
      );
      return;
    }

    addFeature(character.id, feature.key);
  };
}
