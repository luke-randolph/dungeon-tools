import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';

import { ClassFeatureRow } from '@/components/ClassFeatureRow';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { GOBLIN_FAB_CLEARANCE } from '@/constants/layout';
import { Colors } from '@/constants/theme';
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
        <View style={styles.empty}>
          <ThemedText>No character yet.</ThemedText>
          <ThemedText style={styles.hint}>
            Create a character from the chip in the header to start a feature
            list.
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (listed.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.empty}>
          <ThemedText style={styles.hint}>
            Tap a star on the All Features tab to add one.
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
          placeholder="Search features…"
          placeholderTextColor={Colors.mutedText}
          accessibilityLabel="Search features"
          style={[styles.search, { color: '#000', borderColor: Colors.border }]}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

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
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedText>No features match.</ThemedText>
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
  listContent: {
    paddingBottom: GOBLIN_FAB_CLEARANCE,
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
