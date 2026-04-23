import { spellListLabel } from '@dungeon-tools/shared';
import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { SpellRow } from '@/components/SpellRow';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ALL_SPELLS } from '@/data/spells';
import { useToggleSpell } from '@/hooks/useToggleSpell';
import { useCharacters } from '@/stores/characters';
import { useSpellList } from '@/stores/spellList';

export default function SpellListScreen() {
  const router = useRouter();
  const character = useCharacters((s) => s.character);
  const keys = useSpellList((s) => s.keys);
  const loadFor = useSpellList((s) => s.loadFor);
  const toggle = useToggleSpell();

  useEffect(() => {
    if (character) loadFor(character.id);
  }, [character?.id, loadFor, character]);

  const spells = useMemo(
    () => ALL_SPELLS.filter((s) => keys.has(s.key)),
    [keys],
  );

  if (!character) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.empty}>
          <ThemedText>No character yet.</ThemedText>
          <ThemedText style={styles.hint}>
            Create a character from the chip in the header to start a spell list.
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (spells.length === 0) {
    const label = spellListLabel(character.class).toLowerCase();
    return (
      <ThemedView style={styles.container}>
        <View style={styles.empty}>
          <ThemedText>{`${character.name}'s ${label} is empty.`}</ThemedText>
          <ThemedText style={styles.hint}>
            Tap a star on the All Spells tab to add a spell.
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={spells}
        keyExtractor={(s) => s.key}
        renderItem={({ item }) => (
          <SpellRow
            spell={item}
            inList={true}
            onPressRow={() => router.push(`/spells/${item.key}`)}
            onToggleStar={() => toggle(item)}
          />
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: {
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  hint: {
    opacity: 0.7,
    textAlign: 'center',
  },
});
