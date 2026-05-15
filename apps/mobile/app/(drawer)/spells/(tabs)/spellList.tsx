import { spellListLabel } from '@dungeon-tools/shared';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';

import { SpellRow } from '@/components/SpellRow';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/theme';
import { ALL_SPELLS } from '@/data/spells';
import { useColorScheme } from '@/hooks/use-color-scheme';
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

  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

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
        <View style={styles.empty}>
          <ThemedText>No character yet.</ThemedText>
          <ThemedText style={styles.hint}>
            Create a character from the chip in the header to start a spell
            list.
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (listed.length === 0) {
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
      </View>

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
    paddingTop: 12,
    paddingBottom: 8,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  // Clears the goblin FAB at the bottom-right.
  listContent: {
    paddingBottom: 120,
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
