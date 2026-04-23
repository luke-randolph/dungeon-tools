import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { SpellRow } from '@/components/SpellRow';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { searchSpells } from '@/data/spells';
import { useToggleSpell } from '@/hooks/useToggleSpell';
import { useCharacters } from '@/stores/characters';
import { useSpellList } from '@/stores/spellList';

const LEVELS: (number | null)[] = [null, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function levelButtonLabel(level: number | null): string {
  if (level == null) return 'All';
  if (level === 0) return 'Cant';
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

  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  useEffect(() => {
    if (character) loadFor(character.id);
  }, [character?.id, loadFor, character]);

  const spells = useMemo(
    () => searchSpells({ query: search, level: levelFilter }),
    [search, levelFilter],
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.toolbar}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search spells…"
          placeholderTextColor={Colors.light.placeholder}
          style={[
            styles.search,
            {
              color: isDark ? '#fff' : '#000',
              borderColor: Colors.light.border,
            },
          ]}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        <FlatList
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
                style={[
                  styles.levelPill,
                  {
                    borderColor: active ? Colors.light.tint : Colors.light.border,
                    backgroundColor: active ? Colors.light.tint : 'transparent',
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
      </View>

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
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedText>No spells match.</ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toolbar: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 8,
  },
  search: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  levelRow: {
    gap: 6,
    paddingVertical: 4,
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
    color: '#fff',
    fontWeight: '600',
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
});
