import { resolveMaxPicks } from '@dungeon-tools/shared';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { ClassFeatureRow } from '@/components/ClassFeatureRow';
import { EmptyState } from '@/components/EmptyState';
import { GroupAccordion } from '@/components/GroupAccordion';
import { SearchField } from '@/components/SearchField';
import { ThemedView } from '@/components/ThemedView';
import { GOBLIN_FAB_CLEARANCE } from '@/constants/layout';
import { ALL_CLASS_FEATURES } from '@/data/classFeatures';
import { useToggleClassFeature } from '@/hooks/useToggleClassFeature';
import { useCharacters } from '@/stores/characters';
import { useClassFeatureList } from '@/stores/classFeatureList';
import {
  buildFeatureItems,
  collapseScalingChains,
  featureLevelLabel,
} from '@/utils/featureDisplay';

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

  const listed = useMemo(() => {
    if (!character) return [];
    const starred = ALL_CLASS_FEATURES.filter((f) => keys.has(f.key));
    const parentKeys = new Set(
      starred.map((f) => f.parentKey).filter((k): k is string => Boolean(k)),
    );
    const visible = ALL_CLASS_FEATURES.filter(
      (f) => keys.has(f.key) || parentKeys.has(f.key),
    );
    return collapseScalingChains(visible, character.level);
  }, [keys, character]);

  const items = useMemo(() => {
    const q = search.toLowerCase().trim();
    const filtered = q
      ? listed.filter((f) => f.name.toLowerCase().includes(q))
      : listed;
    return buildFeatureItems(filtered);
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
        data={items}
        keyExtractor={(item) =>
          item.kind === 'group' ? `group:${item.parent.key}` : item.feature.key
        }
        renderItem={({ item }) => {
          if (item.kind === 'group') {
            const maxPicks = resolveMaxPicks(
              item.parent,
              character.level,
              ALL_CLASS_FEATURES,
            );
            const q = search.toLowerCase().trim();
            const matchesChild =
              q.length > 0 &&
              item.children.some((c) => c.name.toLowerCase().includes(q));
            return (
              <GroupAccordion
                parent={item.parent}
                options={item.children}
                selectedKeys={keys}
                meta={`${featureLevelLabel(item.parent)} · Pick ${maxPicks}`}
                unlocked
                defaultOpen={matchesChild}
                onPressOption={(c) => router.push(`/features/${c.key}`)}
                onToggleOption={(c) => toggle(c)}
              />
            );
          }
          return (
            <ClassFeatureRow
              feature={item.feature}
              inList
              unlocked
              onPressRow={() => router.push(`/features/${item.feature.key}`)}
              onToggleStar={() => toggle(item.feature)}
            />
          );
        }}
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
