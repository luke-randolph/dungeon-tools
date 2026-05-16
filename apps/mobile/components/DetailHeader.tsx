import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { StarIcon } from '@/components/StarIcon';
import { ThemedText } from '@/components/ThemedText';

interface DetailHeaderProps {
  onBack: () => void;
  backAccessibilityLabel: string;
  starFilled: boolean;
  onToggleStar: () => void;
  starAccessibilityLabel: string;
  unfilledStarColor?: string;
}

export function DetailHeader({
  onBack,
  backAccessibilityLabel,
  starFilled,
  onToggleStar,
  starAccessibilityLabel,
  unfilledStarColor,
}: DetailHeaderProps) {
  return (
    <View style={styles.topBar}>
      <Pressable
        onPress={onBack}
        hitSlop={12}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel={backAccessibilityLabel}
      >
        <Ionicons name="chevron-back" size={20} />
        <ThemedText>Back</ThemedText>
      </Pressable>
      <Pressable
        onPress={onToggleStar}
        hitSlop={12}
        style={styles.starButton}
        accessibilityRole="button"
        accessibilityLabel={starAccessibilityLabel}
      >
        <StarIcon
          filled={starFilled}
          size={26}
          unfilledColor={unfilledStarColor}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
