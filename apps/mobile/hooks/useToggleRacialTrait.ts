import type { RacialTrait } from '@dungeon-tools/shared';
import { getChildren, getParent, isParent } from '@dungeon-tools/shared';

import { ALL_RACIAL_TRAITS } from '@/data/racialTraits';
import { useCharacters } from '@/stores/characters';
import { useRacialTraitPicks } from '@/stores/racialTraitPicks';
import { showAlert } from '@/utils/dialogs';

export function useToggleRacialTrait() {
  const character = useCharacters((s) => s.character);
  const keys = useRacialTraitPicks((s) => s.keys);
  const addPick = useRacialTraitPicks((s) => s.addPick);
  const removePick = useRacialTraitPicks((s) => s.removePick);

  return function toggle(trait: RacialTrait) {
    if (!character) return;

    if (isParent(trait)) {
      showAlert(trait.name, 'Pick one of the options below.');
      return;
    }

    if (keys.has(trait.key)) {
      removePick(character.id, trait.key);
      return;
    }

    const parent = getParent(trait, ALL_RACIAL_TRAITS);
    if (parent) {
      const maxPicks = parent.maxPicks ?? 0;
      const selectedSiblings = getChildren(parent, ALL_RACIAL_TRAITS).filter(
        (s) => keys.has(s.key),
      );

      if (maxPicks === 1) {
        for (const s of selectedSiblings) {
          removePick(character.id, s.key);
        }
      } else if (selectedSiblings.length >= maxPicks) {
        showAlert(
          `${parent.name} — limit reached`,
          `You've already selected ${maxPicks}. Remove one first.`,
        );
        return;
      }
    }

    addPick(character.id, trait.key);
  };
}
