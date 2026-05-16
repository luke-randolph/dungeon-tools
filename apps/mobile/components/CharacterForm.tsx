import {
  CLASSES,
  CLASS_LABELS,
  RACES,
  RACE_LABELS,
  type CharacterClass,
  type CharacterRace,
} from '@dungeon-tools/shared';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { LevelStepper } from '@/components/LevelStepper';
import { Pills } from '@/components/Pills';
import { ThemedText } from '@/components/ThemedText';
import { GOBLIN_FAB_CLEARANCE } from '@/constants/layout';
import { Colors } from '@/constants/theme';
import { showAlert } from '@/utils/dialogs';

export interface CharacterFormValues {
  name: string;
  race: CharacterRace;
  class: CharacterClass;
  level: number;
}

interface CharacterFormProps {
  initialValues?: Partial<CharacterFormValues>;
  submitLabel: string;
  onSubmit: (values: CharacterFormValues) => Promise<void>;
  onCancel: () => void;
}

export function CharacterForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: CharacterFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [race, setRace] = useState<CharacterRace | null>(
    initialValues?.race ?? null,
  );
  const [characterClass, setCharacterClass] = useState<CharacterClass | null>(
    initialValues?.class ?? null,
  );
  const [level, setLevel] = useState(initialValues?.level ?? 1);
  const [saving, setSaving] = useState(false);

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed) {
      showAlert('Name required', 'Give your character a name.');
      return;
    }
    if (!race || !characterClass) {
      showAlert('Pick a race and class');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ name: trimmed, race, class: characterClass, level });
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
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedText type="subtitle" style={styles.label}>
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

      <ThemedText type="subtitle" style={styles.label}>
        Race
      </ThemedText>
      <Pills
        options={RACES}
        labels={RACE_LABELS}
        selected={race}
        onSelect={setRace}
      />

      <ThemedText type="subtitle" style={styles.label}>
        Class
      </ThemedText>
      <Pills
        options={CLASSES}
        labels={CLASS_LABELS}
        selected={characterClass}
        onSelect={setCharacterClass}
      />

      <ThemedText type="subtitle" style={styles.label}>
        Level
      </ThemedText>
      <LevelStepper value={level} onChange={setLevel} />

      <View style={styles.actions}>
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          style={[styles.button, styles.cancelButton]}
        >
          <ThemedText style={styles.buttonLabel}>Cancel</ThemedText>
        </Pressable>
        <Pressable
          onPress={submit}
          disabled={saving}
          accessibilityRole="button"
          style={[
            styles.button,
            styles.submitButton,
            saving && styles.disabled,
          ]}
        >
          <ThemedText style={styles.buttonLabel}>
            {saving ? 'Saving…' : submitLabel}
          </ThemedText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 8,
    paddingBottom: GOBLIN_FAB_CLEARANCE,
  },
  label: {
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
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
  submitButton: {
    backgroundColor: Colors.primary,
  },
  disabled: {
    opacity: 0.6,
  },
  buttonLabel: {
    color: Colors.onPrimary,
    fontWeight: '600',
  },
});
