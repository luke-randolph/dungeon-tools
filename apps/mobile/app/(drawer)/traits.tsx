import { RACE_LABELS } from '@dungeon-tools/shared';
import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { GOBLIN_FAB_CLEARANCE } from '@/constants/layout';
import { Colors } from '@/constants/theme';
import { traitsForRace } from '@/data/racialTraits';
import { useCharacters } from '@/stores/characters';

export default function TraitsScreen() {
  const character = useCharacters((s) => s.character);

  const traits = useMemo(
    () => (character ? traitsForRace(character.race) : []),
    [character],
  );

  if (!character) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.empty}>
          <ThemedText>No character yet.</ThemedText>
          <ThemedText style={styles.hint}>
            Create a character from the chip in the header to see racial traits.
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">{RACE_LABELS[character.race]}</ThemedText>
        <ThemedText style={styles.headerHint}>
          {traits.length} {traits.length === 1 ? 'trait' : 'traits'}
        </ThemedText>
      </View>
      <FlatList
        data={traits}
        keyExtractor={(t) => t.key}
        renderItem={({ item }) => (
          <View style={[styles.row, { borderBottomColor: Colors.border }]}>
            <ThemedText style={styles.name}>{item.name}</ThemedText>
            <ThemedText style={styles.body}>{item.body}</ThemedText>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedText>No SRD traits available for this race.</ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 4,
  },
  headerHint: {
    opacity: 0.6,
    fontSize: 13,
  },
  listContent: {
    paddingBottom: GOBLIN_FAB_CLEARANCE,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
  },
  body: {
    lineHeight: 20,
  },
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
