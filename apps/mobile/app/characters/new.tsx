import {
  CLASSES,
  CLASS_LABELS,
  RACES,
  RACE_LABELS,
  type CharacterClass,
  type CharacterRace,
} from '@dungeon-tools/shared';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Pills } from '@/components/Pills';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/theme';
import { useCharacters } from '@/stores/characters';
import { showAlert } from '@/utils/dialogs';

const MIN_LEVEL = 1;
const MAX_LEVEL = 20;

export default function NewCharacterScreen() {
  const router = useRouter();
  const addCharacter = useCharacters((s) => s.addCharacter);

  const [name, setName] = useState('');
  const [race, setRace] = useState<CharacterRace | null>(null);
  const [characterClass, setCharacterClass] = useState<CharacterClass | null>(
    null,
  );
  const [level, setLevel] = useState(1);
  const [saving, setSaving] = useState(false);

  async function save() {
    const trimmed = name.trim();
    if (!trimmed) {
      showAlert('Name required', 'Give your character a name.');
      return;
    }
    if (!race) {
      showAlert('Pick a race');
      return;
    }
    if (!characterClass) {
      showAlert('Pick a class');
      return;
    }

    setSaving(true);
    try {
      await addCharacter({
        name: trimmed,
        race,
        class: characterClass,
        level,
      });
      router.back();
    } catch (err) {
      showAlert(
        'Failed to save',
        err instanceof Error ? err.message : String(err),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText type="subtitle" style={styles.fieldLabel}>
          Name
        </ThemedText>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Character name"
          placeholderTextColor={Colors.mutedText}
          accessibilityLabel="Character name"
          style={[
            styles.input,
            { color: Colors.text, borderColor: Colors.border },
          ]}
          autoCapitalize="words"
          returnKeyType="done"
        />

        <ThemedText type="subtitle" style={styles.fieldLabel}>
          Race
        </ThemedText>
        <Pills
          options={RACES}
          labels={RACE_LABELS}
          selected={race}
          onSelect={setRace}
        />

        <ThemedText type="subtitle" style={styles.fieldLabel}>
          Class
        </ThemedText>
        <Pills
          options={CLASSES}
          labels={CLASS_LABELS}
          selected={characterClass}
          onSelect={setCharacterClass}
        />

        <ThemedText type="subtitle" style={styles.fieldLabel}>
          Level
        </ThemedText>
        <View style={styles.stepper}>
          <Pressable
            onPress={() => setLevel((l) => Math.max(MIN_LEVEL, l - 1))}
            style={[styles.stepButton, { borderColor: Colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Decrease level"
          >
            <ThemedText style={styles.stepLabel}>−</ThemedText>
          </Pressable>
          <ThemedText style={styles.levelValue}>{level}</ThemedText>
          <Pressable
            onPress={() => setLevel((l) => Math.min(MAX_LEVEL, l + 1))}
            style={[styles.stepButton, { borderColor: Colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Increase level"
          >
            <ThemedText style={styles.stepLabel}>+</ThemedText>
          </Pressable>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            style={[styles.button, styles.cancelButton]}
          >
            <ThemedText style={styles.onDarkLabel}>Cancel</ThemedText>
          </Pressable>
          <Pressable
            onPress={save}
            disabled={saving}
            accessibilityRole="button"
            style={[
              styles.button,
              styles.saveButton,
              saving && styles.saveButtonDisabled,
            ]}
          >
            <ThemedText style={styles.onDarkLabel}>
              {saving ? 'Saving…' : 'Create'}
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: 16,
    gap: 8,
    paddingBottom: 32,
  },
  fieldLabel: {
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
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
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.secondary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  onDarkLabel: {
    color: '#fff',
    fontWeight: '600',
  },
});
