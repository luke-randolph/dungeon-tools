import { CLASS_LABELS } from '@dungeon-tools/shared';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/theme';
import { getClassFeature } from '@/data/classFeatures';
import { useToggleClassFeature } from '@/hooks/useToggleClassFeature';
import { useCharacters } from '@/stores/characters';
import { useClassFeatureList } from '@/stores/classFeatureList';

function levelLabel(level: number): string {
  if (level === 1) return '1st-level';
  if (level === 2) return '2nd-level';
  if (level === 3) return '3rd-level';
  return `${level}th-level`;
}

export default function ClassFeatureDetailScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const router = useRouter();
  const character = useCharacters((s) => s.character);
  const feature = key ? getClassFeature(key) : undefined;
  const inList = useClassFeatureList((s) =>
    feature ? s.keys.has(feature.key) : false,
  );
  const toggle = useToggleClassFeature();

  if (!feature) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.notFound}>
          <ThemedText type="title">Feature not found</ThemedText>
          <Pressable onPress={() => router.back()} style={styles.backInline}>
            <Ionicons name="chevron-back" size={20} />
            <ThemedText>Back</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  const unlocked = !character || character.level >= feature.level;
  const starColor = inList
    ? '#fbbf24'
    : unlocked
      ? Colors.light.placeholder
      : '#bbb';

  return (
    <ThemedView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back to features"
        >
          <Ionicons name="chevron-back" size={20} />
          <ThemedText>Back</ThemedText>
        </Pressable>
        <Pressable
          onPress={() => toggle(feature)}
          hitSlop={12}
          style={styles.starButton}
          accessibilityRole="button"
          accessibilityLabel={
            inList ? `Remove ${feature.name}` : `Add ${feature.name}`
          }
        >
          <Ionicons
            name={inList ? 'star' : 'star-outline'}
            size={26}
            color={starColor}
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">{feature.name}</ThemedText>
        <ThemedText style={styles.subtitle}>
          {CLASS_LABELS[feature.class]} · {levelLabel(feature.level)}
        </ThemedText>
        <ThemedText style={styles.body}>{feature.body}</ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  starButton: {
    paddingHorizontal: 4,
  },
  content: {
    paddingHorizontal: 16,
    // Bottom padding clears the goblin FAB.
    paddingBottom: 120,
    gap: 8,
  },
  subtitle: {
    fontStyle: 'italic',
    opacity: 0.8,
    marginBottom: 8,
  },
  body: {
    lineHeight: 22,
  },
  notFound: {
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  backInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
