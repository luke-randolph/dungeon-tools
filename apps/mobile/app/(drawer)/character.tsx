import { CLASS_LABELS, RACE_LABELS } from '@dungeon-tools/shared';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CharacterForm } from '@/components/CharacterForm';
import { Field } from '@/components/Field';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { GOBLIN_FAB_CLEARANCE } from '@/constants/layout';
import { Colors } from '@/constants/theme';
import { getClassDetail } from '@/data/classes';
import { useCharacters } from '@/stores/characters';
import { showConfirm } from '@/utils/dialogs';

export default function CharacterScreen() {
  const router = useRouter();
  const character = useCharacters((s) => s.character);
  const updateCharacter = useCharacters((s) => s.updateCharacter);
  const removeCharacter = useCharacters((s) => s.removeCharacter);

  const [editing, setEditing] = useState(false);

  if (!character) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyState}>
          <ThemedText type="title">No character yet</ThemedText>
          <ThemedText style={styles.emptyHint}>
            Tap the chip in the header, or the button below, to create one.
          </ThemedText>
          <Pressable
            onPress={() => router.push('/characters/new')}
            style={styles.standaloneButton}
            accessibilityRole="button"
          >
            <ThemedText style={styles.onDarkLabel}>+ New character</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  function confirmDelete() {
    if (!character) return;
    showConfirm(
      `Delete ${character.name}?`,
      'Their spell list will be deleted too. This cannot be undone.',
      {
        confirmLabel: 'Delete',
        destructive: true,
        onConfirm: async () => {
          await removeCharacter(character.id);
        },
      },
    );
  }

  if (editing) {
    return (
      <ThemedView style={styles.container}>
        <CharacterForm
          initialValues={{
            name: character.name,
            race: character.race,
            class: character.class,
            level: character.level,
          }}
          submitLabel="Save"
          onSubmit={async (values) => {
            await updateCharacter(character.id, values);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">{character.name}</ThemedText>
        <View style={styles.fields}>
          <Field label="Race" value={RACE_LABELS[character.race]} />
          <Field label="Class" value={CLASS_LABELS[character.class]} />
          <Field label="Level" value={String(character.level)} />
        </View>

        {(() => {
          const detail = getClassDetail(character.class);
          if (!detail) return null;
          return (
            <View style={styles.classBody}>
              <ThemedText style={styles.classBodyText}>
                {detail.body}
              </ThemedText>
            </View>
          );
        })()}

        <View style={styles.links}>
          <LinkRow
            icon="ribbon-outline"
            label="Class Features"
            onPress={() => router.push('/features')}
          />
          <LinkRow
            icon="leaf-outline"
            label="Traits"
            onPress={() => router.push('/traits')}
          />
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => setEditing(true)}
            style={[styles.button, styles.primaryButton]}
            accessibilityRole="button"
          >
            <ThemedText style={styles.onDarkLabel}>Edit</ThemedText>
          </Pressable>
        </View>
      </ScrollView>

      <Pressable
        onPress={confirmDelete}
        style={styles.deleteButton}
        accessibilityRole="button"
      >
        <ThemedText style={styles.onDarkLabel}>Delete character</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

function LinkRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.linkRow,
        pressed && styles.linkRowPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={20} color={Colors.text} />
      <ThemedText style={styles.linkLabel}>{label}</ThemedText>
      <Ionicons name="chevron-forward" size={18} color={Colors.mutedText} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: GOBLIN_FAB_CLEARANCE },
  fields: { gap: 10, marginTop: 8 },
  classBody: {
    marginTop: 16,
  },
  classBodyText: {
    lineHeight: 20,
    opacity: 0.85,
  },
  links: {
    marginTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  linkRowPressed: {
    opacity: 0.5,
  },
  linkLabel: {
    flex: 1,
    fontSize: 16,
  },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: { flex: 1, backgroundColor: Colors.primary },
  onDarkLabel: { color: Colors.onPrimary, fontWeight: '600' },
  standaloneButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignSelf: 'flex-start',
  },
  emptyState: {
    flex: 1,
    padding: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  emptyHint: {
    opacity: 0.7,
    lineHeight: 20,
  },
  deleteButton: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.destructive,
    borderRadius: 8,
  },
});
