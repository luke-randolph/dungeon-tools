import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { ClassFeatureRow } from "@/components/ClassFeatureRow";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ALL_CLASS_FEATURES } from "@/data/classFeatures";
import { useToggleClassFeature } from "@/hooks/useToggleClassFeature";
import { useCharacters } from "@/stores/characters";
import { useClassFeatureList } from "@/stores/classFeatureList";

export default function FeatureListScreen() {
  const router = useRouter();
  const character = useCharacters((s) => s.character);
  const keys = useClassFeatureList((s) => s.keys);
  const loadFor = useClassFeatureList((s) => s.loadFor);
  const toggle = useToggleClassFeature();

  useEffect(() => {
    if (character) loadFor(character.id);
  }, [character?.id, loadFor, character]);

  const features = useMemo(
    () => ALL_CLASS_FEATURES.filter((f) => keys.has(f.key)),
    [keys],
  );

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

  if (features.length === 0) {
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
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Clears the goblin FAB at the bottom-right.
  listContent: {
    paddingBottom: 120,
  },
  empty: {
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  hint: {
    opacity: 0.7,
    textAlign: "center",
  },
});
