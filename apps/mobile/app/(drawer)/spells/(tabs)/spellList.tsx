import { spellListLabel } from '@dungeon-tools/shared';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { SearchField } from '@/components/SearchField';
import { SpellRow } from '@/components/SpellRow';
import { ThemedView } from '@/components/ThemedView';
import { GOBLIN_FAB_CLEARANCE } from '@/constants/layout';
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

  const [search, setSearch] = useState('');

  useEffect(() => {
    if (character) loadFor(character.id);
  }, [character?.id, loadFor, character]);

  const listed = useMemo(
    () => ALL_SPELLS.filter((s) => keys.has(s.key)),
    [keys],
  );

  const spells = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return listed;
    return listed.filter((s) => s.name.toLowerCase().includes(q));
  }, [listed, search]);

  if (!character) {
    return (
      <ThemedView style={styles.container}>
        <EmptyState
          title="No character yet."
          message="Create a character from the chip in the header to start a spell list."
        />
      </ThemedView>
    );
  }

  if (listed.length === 0) {
    const label = spellListLabel(character.class).toLowerCase();
    return (
      <ThemedView style={styles.container}>
        <EmptyState
          title={`${character.name}'s ${label} is empty.`}
          message="Tap a star on the All Spells tab to add a spell."
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder="Search spells…"
        accessibilityLabel="Search spells"
      />

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
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState title="No spells match." />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: {
    paddingBottom: GOBLIN_FAB_CLEARANCE,
  },
});
