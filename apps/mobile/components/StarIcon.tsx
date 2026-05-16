import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';

interface StarIconProps {
  filled: boolean;
  size: number;
  unfilledColor?: string;
}

export function StarIcon({
  filled,
  size,
  unfilledColor = Colors.mutedText,
}: StarIconProps) {
  if (!filled) {
    return <Ionicons name="star-outline" size={size} color={unfilledColor} />;
  }
  return (
    <View>
      <Ionicons name="star" size={size} color={Colors.accent} />
      <Ionicons
        name="star-outline"
        size={size}
        color={Colors.text}
        style={styles.outline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outline: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
