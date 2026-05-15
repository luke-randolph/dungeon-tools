import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

const palette = Colors.light;

export function MultiTabNotice() {
  const canReload = Platform.OS === 'web' && typeof window !== 'undefined';

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Open in another tab</Text>
        <Text style={styles.body}>
          This is a web preview of a native mobile app. As such, Dungeon Tools
          5e keeps its data in a single place that only one tab can use at a
          time. Close the other tab, then reload this one (or vice versa).
        </Text>
        {canReload ? (
          <Pressable
            onPress={() => window.location.reload()}
            accessibilityRole="button"
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.buttonText}>Reload</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    maxWidth: 360,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '600',
  },
  body: {
    color: palette.text,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    opacity: 0.8,
  },
  button: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: palette.primary,
  },
  pressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
