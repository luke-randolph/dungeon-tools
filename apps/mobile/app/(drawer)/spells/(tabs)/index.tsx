import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { FlatList as GHFlatList } from 'react-native-gesture-handler';

import { EmptyState } from '@/components/EmptyState';
import { SearchField } from '@/components/SearchField';
import { SpellRow } from '@/components/SpellRow';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { GOBLIN_FAB_CLEARANCE } from '@/constants/layout';
import { Colors } from '@/constants/theme';
import { searchSpells } from '@/data/spells';
import { useToggleSpell } from '@/hooks/useToggleSpell';
import { useWebDragScroll } from '@/hooks/useWebDragScroll';
import { useCharacters } from '@/stores/characters';
import { useSpellList } from '@/stores/spellList';

const LEVELS: (number | null)[] = [null, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const FADE_COLORS = ['rgba(232,216,176,0)', 'rgba(232,216,176,1)'] as const;

function levelButtonLabel(level: number | null): string {
  if (level == null) return 'All';
  if (level === 0) return 'Cantrip';
  return String(level);
}

export default function AllSpellsScreen() {
  const router = useRouter();
  const character = useCharacters((s) => s.character);
  const keys = useSpellList((s) => s.keys);
  const loadFor = useSpellList((s) => s.loadFor);
  const toggle = useToggleSpell();

  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const pillsRef = useWebDragScroll();

  useEffect(() => {
    if (character) loadFor(character.id);
  }, [character?.id, loadFor, character]);

  const spells = useMemo(
    () => searchSpells({ query: search, level: levelFilter }),
    [search, levelFilter],
  );

  return (
    <ThemedView style={styles.container}>
      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder="Search spells…"
        accessibilityLabel="Search spells"
      >
        <View style={styles.pillRowWrap}>
          <GHFlatList
            ref={pillsRef}
            data={LEVELS}
            horizontal
            keyExtractor={(l) => String(l)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.levelRow}
            renderItem={({ item }) => {
              const active = levelFilter === item;
              return (
                <Pressable
                  onPress={() => setLevelFilter(item)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={
                    item == null
                      ? 'Show all spell levels'
                      : item === 0
                        ? 'Filter to cantrips'
                        : `Filter to level ${item} spells`
                  }
                  style={[
                    styles.levelPill,
                    {
                      borderColor: active ? Colors.primary : Colors.border,
                      backgroundColor: active ? Colors.primary : 'transparent',
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.levelLabel,
                      active ? styles.levelLabelActive : undefined,
                    ]}
                  >
                    {levelButtonLabel(item)}
                  </ThemedText>
                </Pressable>
              );
            }}
          />
          <LinearGradient
            pointerEvents="none"
            colors={FADE_COLORS}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fadeRight}
          />
        </View>
      </SearchField>

      <FlatList
        data={spells}
        keyExtractor={(s) => s.key}
        renderItem={({ item }) => (
          <SpellRow
            spell={item}
            inList={keys.has(item.key)}
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
  pillRowWrap: { position: 'relative' },
  fadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 60,
  },
  levelRow: {
    gap: 6,
    paddingVertical: 4,
    paddingRight: 32,
  },
  levelPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    minWidth: 40,
    alignItems: 'center',
  },
  levelLabel: {
    fontSize: 13,
  },
  levelLabelActive: {
    color: Colors.onPrimary,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: GOBLIN_FAB_CLEARANCE,
  },
});
