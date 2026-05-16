import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/theme';

export const MIN_LEVEL = 1;
export const MAX_LEVEL = 20;

interface LevelStepperProps {
  value: number;
  onChange: (level: number) => void;
}

export function LevelStepper({ value, onChange }: LevelStepperProps) {
  return (
    <View style={styles.stepper}>
      <Pressable
        onPress={() => onChange(Math.max(MIN_LEVEL, value - 1))}
        style={[styles.stepButton, { borderColor: Colors.border }]}
        accessibilityRole="button"
        accessibilityLabel="Decrease level"
      >
        <ThemedText style={styles.stepLabel}>−</ThemedText>
      </Pressable>
      <ThemedText style={styles.levelValue}>{value}</ThemedText>
      <Pressable
        onPress={() => onChange(Math.min(MAX_LEVEL, value + 1))}
        style={[styles.stepButton, { borderColor: Colors.border }]}
        accessibilityRole="button"
        accessibilityLabel="Increase level"
      >
        <ThemedText style={styles.stepLabel}>+</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontSize: 20,
    fontWeight: '600',
  },
  levelValue: {
    fontSize: 20,
    fontWeight: '600',
    minWidth: 28,
    textAlign: 'center',
  },
});
