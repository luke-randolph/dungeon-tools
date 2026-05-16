import { CLASS_LABELS } from '@dungeon-tools/shared';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { ClassFeatureRow } from '@/components/ClassFeatureRow';
import { EmptyState } from '@/components/EmptyState';
import { SearchField } from '@/components/SearchField';
import { ThemedView } from '@/components/ThemedView';
import { GOBLIN_FAB_CLEARANCE } from '@/constants/layout';
import { searchClassFeatures } from '@/data/classFeatures';
import { useToggleClassFeature } from '@/hooks/useToggleClassFeature';
import { useCharacters } from '@/stores/characters';
import { useClassFeatureList } from '@/stores/classFeatureList';

export default function AllFeaturesScreen() {
  const router = useRouter();
  const character = useCharacters((s) => s.character);
  const keys = useClassFeatureList((s) => s.keys);
  const loadFor = useClassFeatureList((s) => s.loadFor);
  const toggle = useToggleClassFeature();

  const [search, setSearch] = useState('');

  useEffect(() => {
    if (character) loadFor(character.id);
  }, [character?.id, loadFor, character]);

  const features = useMemo(
    () =>
      character
        ? searchClassFeatures({ query: search, charClass: character.class })
        : [],
    [search, character],
  );

  if (!character) {
    return (
      <ThemedView style={styles.container}>
        <EmptyState
          title="No character yet."
          message="Create a character from the chip in the header to see class features."
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder={`Search ${CLASS_LABELS[character.class]} features…`}
        accessibilityLabel={`Search ${CLASS_LABELS[character.class]} features`}
      />

      <FlatList
        data={features}
        keyExtractor={(f) => f.key}
        renderItem={({ item }) => (
          <ClassFeatureRow
            feature={item}
            inList={keys.has(item.key)}
            unlocked={character.level >= item.level}
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
