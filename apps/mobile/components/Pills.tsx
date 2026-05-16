import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/theme';

interface PillsProps<T extends string> {
  options: readonly T[];
  labels: Record<T, string>;
  selected: T | null;
  onSelect: (val: T) => void;
}

/** A wrapping row of single-select option pills. */
export function Pills<T extends string>({
  options,
  labels,
  selected,
  onSelect,
}: PillsProps<T>) {
  return (
    <View style={styles.pills}>
      {options.map((opt) => {
        const active = selected === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => onSelect(opt)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[
              styles.pill,
              { borderColor: active ? Colors.primary : Colors.border },
              active && styles.pillActive,
            ]}
          >
            <ThemedText
              style={[styles.pillLabel, active && styles.pillLabelActive]}
            >
              {labels[opt]}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillActive: { backgroundColor: Colors.primary },
  pillLabel: { fontSize: 14 },
  pillLabelActive: { color: '#fff', fontWeight: '600' },
});
