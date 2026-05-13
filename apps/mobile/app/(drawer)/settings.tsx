import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ExternalLink } from '@/components/ExternalLink';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/theme';
import { resetDatabase } from '@/db';
import { useCharacters } from '@/stores/characters';
import { showConfirm } from '@/utils/dialogs';

export default function SettingsScreen() {
  const refresh = useCharacters((s) => s.refresh);

  function confirmReset() {
    showConfirm(
      'Reset database?',
      'This deletes all characters and spell lists on this device.',
      {
        confirmLabel: 'Reset',
        destructive: true,
        onConfirm: async () => {
          await resetDatabase();
          await refresh();
        },
      },
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Settings</ThemedText>

        <ThemedText type="subtitle" style={styles.heading}>
          Theme
        </ThemedText>
        <ThemedText style={styles.body}>
          The app is currently parchment-only. A &ldquo;candlelit&rdquo; dark
          mode is planned &mdash; warm dark stone background, parchment-cream
          text, gold accents &mdash; the feel of reading a tome by torchlight.
          Not implemented yet; the app stays in parchment mode regardless of
          system theme.
        </ThemedText>

        <ThemedText type="subtitle" style={styles.heading}>
          Attribution
        </ThemedText>
        <ThemedText style={styles.body}>
          This app includes material from the System Reference Document 5.1 by
          Wizards of the Coast LLC, used under the Creative Commons
          Attribution 4.0 International License. Spell data has been
          reformatted (the source JSON structure was normalized for use in
          this app); rules text is unmodified.
        </ThemedText>
        <ThemedText style={styles.body}>
          Source:{' '}
          <ExternalLink href="https://dnd.wizards.com/resources/systems-reference-document">
            dnd.wizards.com/resources/systems-reference-document
          </ExternalLink>
        </ThemedText>
        <ThemedText style={styles.body}>
          License:{' '}
          <ExternalLink href="https://creativecommons.org/licenses/by/4.0/">
            creativecommons.org/licenses/by/4.0
          </ExternalLink>
        </ThemedText>
        <ThemedText style={styles.disclaimer}>
          Dungeon Tools 5e is an unofficial fan utility and is not affiliated
          with, endorsed, sponsored, or specifically approved by Wizards of
          the Coast LLC.
        </ThemedText>

        {__DEV__ ? (
          <Pressable style={styles.dangerButton} onPress={confirmReset}>
            <ThemedText style={styles.dangerLabel}>
              Reset database (dev)
            </ThemedText>
          </Pressable>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  heading: {
    marginTop: 16,
  },
  body: {
    lineHeight: 20,
  },
  disclaimer: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  dangerButton: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.destructive,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  dangerLabel: {
    color: '#fff',
    fontWeight: '600',
  },
});
