import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function DiceScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Dice</ThemedText>
      <ThemedText>Coming soon.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
});
