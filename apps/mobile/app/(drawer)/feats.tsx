import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function FeatsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Feats</ThemedText>
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
