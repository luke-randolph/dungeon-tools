import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface NotFoundProps {
  title: string;
  onBack: () => void;
}

export function NotFound({ title, onBack }: NotFoundProps) {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.notFound}>
        <ThemedText type="title">{title}</ThemedText>
        <Pressable
          onPress={onBack}
          style={styles.backInline}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={20} />
          <ThemedText>Back</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: {
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  backInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
