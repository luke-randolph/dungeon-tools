import { CLASS_LABELS } from '@dungeon-tools/shared';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';

import { ClassFeatureRow } from '@/components/ClassFeatureRow';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/theme';
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
        <View style={styles.empty}>
          <ThemedText>No character yet.</ThemedText>
          <ThemedText style={styles.hint}>
            Create a character from the chip in the header to see class
            features.
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
          placeholder={`Search ${CLASS_LABELS[character.class]} features…`}
          placeholderTextColor={Colors.mutedText}
          accessibilityLabel={`Search ${CLASS_LABELS[character.class]} features`}
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
            inList={keys.has(item.key)}
            unlocked={character.level >= item.level}
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
