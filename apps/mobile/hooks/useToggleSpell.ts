import { spellWarnings, type Spell } from '@dungeon-tools/shared';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { useCharacters } from '@/stores/characters';
import { useSpellList } from '@/stores/spellList';

export function useToggleSpell() {
  const router = useRouter();
  const character = useCharacters((s) => s.character);
  const keys = useSpellList((s) => s.keys);
  const addSpell = useSpellList((s) => s.addSpell);
  const removeSpell = useSpellList((s) => s.removeSpell);

  return function toggle(spell: Spell) {
    if (!character) {
      Alert.alert(
        'Create a character first',
        "Spells are added to a specific character's list.",
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create one', onPress: () => router.push('/characters/new') },
        ],
      );
      return;
    }

    if (keys.has(spell.key)) {
      removeSpell(character.id, spell.key);
      return;
    }

    const warnings = spellWarnings(character, spell);
    if (warnings.length > 0) {
      Alert.alert(
        `Add ${spell.name}?`,
        warnings.map((w) => w.message).join('\n\n'),
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add anyway', onPress: () => addSpell(character.id, spell.key) },
        ],
      );
    } else {
      addSpell(character.id, spell.key);
    }
  };
}
