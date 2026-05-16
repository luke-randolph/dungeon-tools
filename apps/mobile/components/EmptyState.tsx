import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';

interface EmptyStateProps {
  title?: string;
  message?: string;
  children?: ReactNode;
}

export function EmptyState({ title, message, children }: EmptyStateProps) {
  return (
    <View style={styles.empty}>
      {title ? <ThemedText>{title}</ThemedText> : null}
      {message ? (
        <ThemedText style={styles.message}>{message}</ThemedText>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  message: {
    opacity: 0.7,
    textAlign: 'center',
  },
});
