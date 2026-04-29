import { spellWarnings, type Spell } from '@dungeon-tools/shared';
import { useRouter } from 'expo-router';

import { useCharacters } from '@/stores/characters';
import { useSpellList } from '@/stores/spellList';
import { showConfirm } from '@/utils/dialogs';

export function useToggleSpell() {
  const router = useRouter();
  const character = useCharacters((s) => s.character);
  const keys = useSpellList((s) => s.keys);
  const addSpell = useSpellList((s) => s.addSpell);
  const removeSpell = useSpellList((s) => s.removeSpell);

  return function toggle(spell: Spell) {
    if (!character) {
      showConfirm(
        'Create a character first',
        "Spells are added to a specific character's list.",
        {
          confirmLabel: 'Create one',
          onConfirm: () => router.push('/characters/new'),
        },
      );
      return;
    }

    if (keys.has(spell.key)) {
      removeSpell(character.id, spell.key);
      return;
    }

    const warnings = spellWarnings(character, spell);
    if (warnings.length > 0) {
      showConfirm(
        `Add ${spell.name}?`,
        warnings.map((w) => w.message).join('\n\n'),
        {
          confirmLabel: 'Add anyway',
          onConfirm: () => addSpell(character.id, spell.key),
        },
      );
    } else {
      addSpell(character.id, spell.key);
    }
  };
}
