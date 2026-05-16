import { CLASS_LABELS } from '@dungeon-tools/shared';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { DetailHeader } from '@/components/DetailHeader';
import { NotFound } from '@/components/NotFound';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { GOBLIN_FAB_CLEARANCE } from '@/constants/layout';
import { Colors } from '@/constants/theme';
import { getClassFeature } from '@/data/classFeatures';
import { useToggleClassFeature } from '@/hooks/useToggleClassFeature';
import { useCharacters } from '@/stores/characters';
import { useClassFeatureList } from '@/stores/classFeatureList';
import { levelLabel } from '@/utils/levelLabel';

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
    return <NotFound title="Feature not found" onBack={() => router.back()} />;
  }

  const unlocked = !character || character.level >= feature.level;

  return (
    <ThemedView style={styles.container}>
      <DetailHeader
        onBack={() => router.back()}
        backAccessibilityLabel="Back to features"
        starFilled={inList}
        onToggleStar={() => toggle(feature)}
        starAccessibilityLabel={
          inList ? `Remove ${feature.name}` : `Add ${feature.name}`
        }
        unfilledStarColor={unlocked ? Colors.mutedText : Colors.lockedIcon}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">{feature.name}</ThemedText>
        <ThemedText style={styles.subtitle}>
          {CLASS_LABELS[feature.class]} ·{' '}
          {levelLabel(feature.level, { hyphenated: true })}
        </ThemedText>
        <ThemedText style={styles.body}>{feature.body}</ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingBottom: GOBLIN_FAB_CLEARANCE,
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
});
