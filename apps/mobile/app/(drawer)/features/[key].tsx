import { CLASS_LABELS, isParent } from '@dungeon-tools/shared';
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
import {
  featureLevelLabel,
  isFeatureInList,
  resolveDisplayFeature,
} from '@/utils/featureDisplay';

export default function ClassFeatureDetailScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const router = useRouter();
  const character = useCharacters((s) => s.character);
  const rawFeature = key ? getClassFeature(key) : undefined;
  const feature =
    rawFeature && character
      ? resolveDisplayFeature(rawFeature, character.level)
      : rawFeature;
  const inList = useClassFeatureList((s) =>
    feature ? isFeatureInList(feature, s.keys) : false,
  );
  const toggle = useToggleClassFeature();

  if (!feature) {
    return <NotFound title="Feature not found" onBack={() => router.back()} />;
  }

  const unlocked = !character || character.level >= feature.level;
  const showStar = !isParent(feature);

  return (
    <ThemedView style={styles.container}>
      <DetailHeader
        onBack={() => router.back()}
        backAccessibilityLabel="Back to features"
        showStar={showStar}
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
          {CLASS_LABELS[feature.class]} · {featureLevelLabel(feature)}
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
