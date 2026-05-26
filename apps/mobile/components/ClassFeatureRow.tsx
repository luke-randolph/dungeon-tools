import type { ClassFeature } from '@dungeon-tools/shared';
import { Pressable, StyleSheet, View } from 'react-native';

import { StarIcon } from '@/components/StarIcon';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/theme';
import { featureLevelLabel } from '@/utils/featureDisplay';

export interface ClassFeatureRowProps {
  feature: ClassFeature;
  inList: boolean;
  /** True when the active character qualifies (char level >= feature level). */
  unlocked: boolean;
  onPressRow: () => void;
  onToggleStar: () => void;
}

export function ClassFeatureRow({
  feature,
  inList,
  unlocked,
  onPressRow,
  onToggleStar,
}: ClassFeatureRowProps) {
  const level = featureLevelLabel(feature);
  const unfilledStarColor = unlocked ? Colors.mutedText : Colors.lockedIcon;

  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.body, !unlocked && !inList && styles.locked]}
        onPress={onPressRow}
        accessibilityRole="button"
        accessibilityLabel={`${feature.name}, ${level}`}
      >
        <ThemedText style={styles.name}>{feature.name}</ThemedText>
        <ThemedText style={styles.meta}>{level}</ThemedText>
      </Pressable>
      <Pressable
        style={styles.starButton}
        onPress={onToggleStar}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityState={{ selected: inList }}
        accessibilityLabel={
          inList ? `Remove ${feature.name}` : `Add ${feature.name}`
        }
      >
        <StarIcon filled={inList} size={22} unfilledColor={unfilledStarColor} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.rowBorder,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 2,
  },
  locked: {
    opacity: 0.5,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
  },
  meta: {
    fontSize: 12,
    opacity: 0.7,
  },
  starButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
