import type { RacialTrait } from '@dungeon-tools/shared';
import { RACE_LABELS, getChildren, isParent } from '@dungeon-tools/shared';
import { useEffect, useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { DraconicAncestryChart } from '@/components/DraconicAncestryChart';
import { EmptyState } from '@/components/EmptyState';
import { GroupAccordion } from '@/components/GroupAccordion';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { GOBLIN_FAB_CLEARANCE } from '@/constants/layout';
import { Colors } from '@/constants/theme';
import { ALL_RACIAL_TRAITS, traitsForRace } from '@/data/racialTraits';
import { useToggleRacialTrait } from '@/hooks/useToggleRacialTrait';
import { useCharacters } from '@/stores/characters';
import { useRacialTraitPicks } from '@/stores/racialTraitPicks';

type TraitItem =
  | { kind: 'trait'; trait: RacialTrait }
  | { kind: 'group'; parent: RacialTrait; options: RacialTrait[] };

function buildTraitItems(traits: RacialTrait[]): TraitItem[] {
  const items: TraitItem[] = [];
  const emittedParents = new Set<string>();
  for (const t of traits) {
    if (isParent(t)) {
      if (emittedParents.has(t.key)) continue;
      emittedParents.add(t.key);
      items.push({
        kind: 'group',
        parent: t,
        options: getChildren(t, ALL_RACIAL_TRAITS),
      });
    } else if (t.parentKey) {
      const parent = ALL_RACIAL_TRAITS.find((p) => p.key === t.parentKey);
      if (parent && !emittedParents.has(parent.key)) {
        emittedParents.add(parent.key);
        items.push({
          kind: 'group',
          parent,
          options: getChildren(parent, ALL_RACIAL_TRAITS),
        });
      }
    } else {
      items.push({ kind: 'trait', trait: t });
    }
  }
  return items;
}

export default function TraitsScreen() {
  const character = useCharacters((s) => s.character);
  const pickKeys = useRacialTraitPicks((s) => s.keys);
  const loadFor = useRacialTraitPicks((s) => s.loadFor);
  const toggle = useToggleRacialTrait();

  useEffect(() => {
    if (character) loadFor(character.id);
  }, [character?.id, loadFor, character]);

  const traits = useMemo(
    () => (character ? traitsForRace(character.race) : []),
    [character],
  );

  const items = useMemo(() => buildTraitItems(traits), [traits]);

  if (!character) {
    return (
      <ThemedView style={styles.container}>
        <EmptyState
          title="No character yet."
          message="Create a character from the chip in the header to see racial traits."
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Traits</ThemedText>
        <ThemedText style={styles.headerHint}>
          {RACE_LABELS[character.race]} · {traits.length}{' '}
          {traits.length === 1 ? 'trait' : 'traits'}
        </ThemedText>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) =>
          item.kind === 'group' ? `group:${item.parent.key}` : item.trait.key
        }
        renderItem={({ item }) => {
          if (item.kind === 'group') {
            const maxPicks = item.parent.maxPicks ?? 1;
            if (item.parent.key === 'draconic-ancestry') {
              return (
                <DraconicAncestryChart
                  parent={item.parent}
                  options={item.options}
                  selectedKeys={pickKeys}
                  meta={`Pick ${maxPicks}`}
                  unlocked
                  onToggleOption={(t) => toggle(t)}
                />
              );
            }
            return (
              <GroupAccordion
                parent={item.parent}
                options={item.options}
                selectedKeys={pickKeys}
                meta={`Pick ${maxPicks}`}
                unlocked
                onPressOption={() => {}}
                onToggleOption={(t) => toggle(t)}
              />
            );
          }
          return (
            <View style={[styles.row, { borderBottomColor: Colors.border }]}>
              <ThemedText style={styles.name}>{item.trait.name}</ThemedText>
              <ThemedText style={styles.body}>{item.trait.body}</ThemedText>
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState title="No SRD traits available for this race." />
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
});
