import type { ClassFeature } from '@dungeon-tools/shared';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface ClassFeatureRowProps {
  feature: ClassFeature;
  inList: boolean;
  /** True when the active character qualifies (char level >= feature level). */
  unlocked: boolean;
  onPressRow: () => void;
  onToggleStar: () => void;
}

function levelLabel(level: number): string {
  if (level === 1) return '1st level';
  if (level === 2) return '2nd level';
  if (level === 3) return '3rd level';
  return `${level}th level`;
}

export function ClassFeatureRow({
  feature,
  inList,
  unlocked,
  onPressRow,
  onToggleStar,
}: ClassFeatureRowProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const borderColor = isDark ? '#222' : '#eee';
  const starColor = inList
    ? '#fbbf24'
    : unlocked
      ? Colors.light.placeholder
      : isDark
        ? '#333'
        : '#d4d4d4';

  return (
    <View style={[styles.row, { borderBottomColor: borderColor }]}>
      <Pressable
        style={[styles.body, !unlocked && !inList && styles.locked]}
        onPress={onPressRow}
        accessibilityRole="button"
        accessibilityLabel={`${feature.name}, ${levelLabel(feature.level)}`}
      >
        <ThemedText style={styles.name}>{feature.name}</ThemedText>
        <ThemedText style={styles.meta}>{levelLabel(feature.level)}</ThemedText>
      </Pressable>
      <Pressable
        style={styles.starButton}
        onPress={onToggleStar}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={
          inList ? `Remove ${feature.name}` : `Add ${feature.name}`
        }
      >
        <Ionicons
          name={inList ? 'star' : 'star-outline'}
          size={22}
          color={starColor}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
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
