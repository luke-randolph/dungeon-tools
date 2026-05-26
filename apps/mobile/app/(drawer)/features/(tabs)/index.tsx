import { CLASS_LABELS, resolveMaxPicks } from '@dungeon-tools/shared';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { ClassFeatureRow } from '@/components/ClassFeatureRow';
import { EmptyState } from '@/components/EmptyState';
import { GroupAccordion } from '@/components/GroupAccordion';
import { SearchField } from '@/components/SearchField';
import { ThemedView } from '@/components/ThemedView';
import { GOBLIN_FAB_CLEARANCE } from '@/constants/layout';
import { ALL_CLASS_FEATURES, searchClassFeatures } from '@/data/classFeatures';
import { useToggleClassFeature } from '@/hooks/useToggleClassFeature';
import { useCharacters } from '@/stores/characters';
import { useClassFeatureList } from '@/stores/classFeatureList';
import {
  buildFeatureItems,
  collapseScalingChains,
  featureLevelLabel,
  isFeatureInList,
} from '@/utils/featureDisplay';

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

  const items = useMemo(() => {
    if (!character) return [];
    const matched = searchClassFeatures({
      query: search,
      charClass: character.class,
    });
    const collapsed = collapseScalingChains(matched, character.level);
    return buildFeatureItems(collapsed);
  }, [search, character]);

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
                unlocked={character.level >= item.parent.level}
                defaultOpen={matchesChild}
                onPressOption={(c) => router.push(`/features/${c.key}`)}
                onToggleOption={(c) => toggle(c)}
              />
            );
          }
          const f = item.feature;
          return (
            <ClassFeatureRow
              feature={f}
              inList={isFeatureInList(f, keys)}
              unlocked={character.level >= f.level}
              onPressRow={() => router.push(`/features/${f.key}`)}
              onToggleStar={() => toggle(f)}
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
