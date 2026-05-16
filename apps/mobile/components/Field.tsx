import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';

interface FieldProps {
  label: string;
  value: string;
  labelWidth?: number;
  compact?: boolean;
}

export function Field({ label, value, labelWidth = 64, compact }: FieldProps) {
  return (
    <View style={[styles.field, compact && styles.fieldCompact]}>
      <ThemedText
        style={[styles.label, compact && styles.dense, { width: labelWidth }]}
      >
        {label}
      </ThemedText>
      <ThemedText style={[styles.value, compact && styles.denseValue]}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  fieldCompact: {
    alignItems: 'flex-start',
  },
  label: {
    opacity: 0.6,
  },
  value: {
    flex: 1,
    fontWeight: '600',
  },
  dense: {
    fontSize: 13,
  },
  denseValue: {
    fontSize: 13,
    fontWeight: '400',
  },
});
