import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { ClassFeatureRow } from '@/components/ClassFeatureRow';
import { EmptyState } from '@/components/EmptyState';
import { SearchField } from '@/components/SearchField';
import { ThemedView } from '@/components/ThemedView';
import { GOBLIN_FAB_CLEARANCE } from '@/constants/layout';
import { ALL_CLASS_FEATURES } from '@/data/classFeatures';
import { useToggleClassFeature } from '@/hooks/useToggleClassFeature';
import { useCharacters } from '@/stores/characters';
import { useClassFeatureList } from '@/stores/classFeatureList';

export default function FeatureListScreen() {
  const router = useRouter();
  const character = useCharacters((s) => s.character);
  const keys = useClassFeatureList((s) => s.keys);
  const loadFor = useClassFeatureList((s) => s.loadFor);
  const toggle = useToggleClassFeature();

  const [search, setSearch] = useState('');

  useEffect(() => {
    if (character) loadFor(character.id);
  }, [character?.id, loadFor, character]);

  const listed = useMemo(
    () => ALL_CLASS_FEATURES.filter((f) => keys.has(f.key)),
    [keys],
  );

  const features = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return listed;
    return listed.filter((f) => f.name.toLowerCase().includes(q));
  }, [listed, search]);

  if (!character) {
    return (
      <ThemedView style={styles.container}>
        <EmptyState
          title="No character yet."
          message="Create a character from the chip in the header to start a feature list."
        />
      </ThemedView>
    );
  }

  if (listed.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <EmptyState message="Tap a star on the All Features tab to add one." />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder="Search features…"
        accessibilityLabel="Search features"
      />

      <FlatList
        data={features}
        keyExtractor={(f) => f.key}
        renderItem={({ item }) => (
          <ClassFeatureRow
            feature={item}
            inList
            unlocked
            onPressRow={() => router.push(`/features/${item.key}`)}
            onToggleStar={() => toggle(item)}
          />
        )}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState title="No features match." />}
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
