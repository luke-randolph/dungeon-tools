import {
  CLASSES,
  CLASS_LABELS,
  RACES,
  RACE_LABELS,
  type CharacterClass,
  type CharacterRace,
} from "@dungeon-tools/shared";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/theme";
import { getClassDetail } from "@/data/classes";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCharacters } from "@/stores/characters";
import { showAlert, showConfirm } from "@/utils/dialogs";

const MIN_LEVEL = 1;
const MAX_LEVEL = 20;

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
      <ThemedText style={styles.fieldValue}>{value}</ThemedText>
    </View>
  );
}

export default function CharacterScreen() {
  const router = useRouter();
  const character = useCharacters((s) => s.character);
  const updateCharacter = useCharacters((s) => s.updateCharacter);
  const removeCharacter = useCharacters((s) => s.removeCharacter);
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [race, setRace] = useState<CharacterRace | null>(null);
  const [characterClass, setCharacterClass] = useState<CharacterClass | null>(
    null,
  );
  const [level, setLevel] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (character && editing) {
      setName(character.name);
      setRace(character.race);
      setCharacterClass(character.class);
      setLevel(character.level);
    }
  }, [character, editing]);

  if (!character) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyState}>
          <ThemedText type="title">No character yet</ThemedText>
          <ThemedText style={styles.emptyHint}>
            Tap the chip in the header, or the button below, to create one.
          </ThemedText>
          <Pressable
            onPress={() => router.push("/characters/new")}
            style={styles.standaloneButton}
            accessibilityRole="button"
          >
            <ThemedText style={styles.onDarkLabel}>+ New character</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  function startEdit() {
    setName(character!.name);
    setRace(character!.race);
    setCharacterClass(character!.class);
    setLevel(character!.level);
    setEditing(true);
  }

  async function saveEdit() {
    const trimmed = name.trim();
    if (!trimmed) {
      showAlert("Name required");
      return;
    }
    if (!race || !characterClass) {
      showAlert("Pick a race and class");
      return;
    }
    setSaving(true);
    try {
      await updateCharacter(character!.id, {
        name: trimmed,
        race,
        class: characterClass,
        level,
      });
      setEditing(false);
    } catch (err) {
      showAlert(
        "Failed to save",
        err instanceof Error ? err.message : String(err),
      );
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete() {
    showConfirm(
      `Delete ${character!.name}?`,
      "Their spell list will be deleted too. This cannot be undone.",
      {
        confirmLabel: "Delete",
        destructive: true,
        onConfirm: async () => {
          await removeCharacter(character!.id);
        },
      },
    );
  }

  if (editing) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedText type="subtitle" style={styles.editLabel}>
            Name
          </ThemedText>
          <TextInput
            value={name}
            onChangeText={setName}
            style={[
              styles.input,
              {
                color: Colors.light.text,
                borderColor: Colors.light.border,
              },
            ]}
            autoCapitalize="words"
          />

          <ThemedText type="subtitle" style={styles.editLabel}>
            Race
          </ThemedText>
          <Pills
            options={RACES}
            labels={RACE_LABELS}
            selected={race}
            onSelect={setRace}
            isDark={isDark}
          />

          <ThemedText type="subtitle" style={styles.editLabel}>
            Class
          </ThemedText>
          <Pills
            options={CLASSES}
            labels={CLASS_LABELS}
            selected={characterClass}
            onSelect={setCharacterClass}
            isDark={isDark}
          />

          <ThemedText type="subtitle" style={styles.editLabel}>
            Level
          </ThemedText>
          <View style={styles.stepper}>
            <Pressable
              onPress={() => setLevel((l) => Math.max(MIN_LEVEL, l - 1))}
              style={[styles.stepButton, { borderColor: Colors.light.border }]}
            >
              <ThemedText style={styles.stepLabel}>−</ThemedText>
            </Pressable>
            <ThemedText style={styles.levelValue}>{level}</ThemedText>
            <Pressable
              onPress={() => setLevel((l) => Math.min(MAX_LEVEL, l + 1))}
              style={[styles.stepButton, { borderColor: Colors.light.border }]}
            >
              <ThemedText style={styles.stepLabel}>+</ThemedText>
            </Pressable>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() => setEditing(false)}
              style={[styles.button, styles.secondaryButton]}
            >
              <ThemedText style={styles.onDarkLabel}>Cancel</ThemedText>
            </Pressable>
            <Pressable
              onPress={saveEdit}
              disabled={saving}
              style={[
                styles.button,
                styles.primaryButton,
                saving && styles.disabled,
              ]}
            >
              <ThemedText style={styles.onDarkLabel}>
                {saving ? "Saving…" : "Save"}
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
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
              <ThemedText style={styles.classBodyText}>{detail.body}</ThemedText>
            </View>
          );
        })()}

        <View style={styles.links}>
          <LinkRow
            icon="ribbon-outline"
            label="Class Features"
            onPress={() => router.push("/features")}
          />
          <LinkRow
            icon="leaf-outline"
            label="Traits"
            onPress={() => router.push("/traits")}
          />
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={startEdit}
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
      style={({ pressed }) => [styles.linkRow, pressed && styles.linkRowPressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={20} color={Colors.light.text} />
      <ThemedText style={styles.linkLabel}>{label}</ThemedText>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={Colors.light.placeholder}
      />
    </Pressable>
  );
}

function Pills<T extends string>({
  options,
  labels,
  selected,
  onSelect,
  isDark,
}: {
  options: readonly T[];
  labels: Record<T, string>;
  selected: T | null;
  onSelect: (val: T) => void;
  isDark: boolean;
}) {
  const inactiveBorder = Colors.light.border;
  return (
    <View style={styles.pills}>
      {options.map((opt) => {
        const active = selected === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => onSelect(opt)}
            style={[
              styles.pill,
              { borderColor: active ? Colors.light.primary : inactiveBorder },
              active && styles.pillActive,
            ]}
          >
            <ThemedText
              style={[styles.pillLabel, active && styles.pillLabelActive]}
            >
              {labels[opt]}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  fields: { gap: 10, marginTop: 8 },
  field: { flexDirection: "row", alignItems: "baseline", gap: 12 },
  fieldLabel: { width: 64, opacity: 0.6 },
  fieldValue: { flex: 1, fontWeight: "600" },
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
    borderTopColor: Colors.light.border,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  linkRowPressed: {
    opacity: 0.5,
  },
  linkLabel: {
    flex: 1,
    fontSize: 16,
  },
  editLabel: { marginTop: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillActive: { backgroundColor: Colors.light.primary },
  pillLabel: { fontSize: 14 },
  pillLabelActive: { color: "#fff", fontWeight: "600" },
  stepper: { flexDirection: "row", alignItems: "center", gap: 16 },
  stepButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: { fontSize: 20, fontWeight: "600" },
  levelValue: {
    fontSize: 20,
    fontWeight: "600",
    minWidth: 28,
    textAlign: "center",
  },
  actions: { flexDirection: "row", gap: 12, marginTop: 24 },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButton: { flex: 1, backgroundColor: Colors.light.secondary },
  primaryButton: { flex: 1, backgroundColor: Colors.light.primary },
  onDarkLabel: { color: "#fff", fontWeight: "600" },
  standaloneButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
    alignSelf: "flex-start",
  },
  emptyState: {
    flex: 1,
    padding: 16,
    gap: 12,
    alignItems: "flex-start",
  },
  emptyHint: {
    opacity: 0.7,
    lineHeight: 20,
  },
  disabled: { opacity: 0.6 },
  deleteButton: {
    position: "absolute",
    bottom: 32,
    left: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.destructive,
    borderRadius: 8,
  },
});
