import { CLASS_LABELS } from '@dungeon-tools/shared';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { GOBLIN_FAB_CLEARANCE } from '@/constants/layout';
import { Colors } from '@/constants/theme';
import { getSpell } from '@/data/spells';
import { useToggleSpell } from '@/hooks/useToggleSpell';
import { useSpellList } from '@/stores/spellList';

function levelLabel(level: number): string {
  if (level === 0) return 'Cantrip';
  if (level === 1) return '1st-level';
  if (level === 2) return '2nd-level';
  if (level === 3) return '3rd-level';
  return `${level}th-level`;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
      <ThemedText style={styles.fieldValue}>{value}</ThemedText>
    </View>
  );
}

function Tag({ children, color }: { children: string; color: string }) {
  return (
    <View style={[styles.tag, { borderColor: color }]}>
      <ThemedText style={[styles.tagLabel, { color }]}>{children}</ThemedText>
    </View>
  );
}

export default function SpellDetailScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const router = useRouter();
  const spell = key ? getSpell(key) : undefined;
  const inList = useSpellList((s) => (spell ? s.keys.has(spell.key) : false));
  const toggle = useToggleSpell();

  if (!spell) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.notFound}>
          <ThemedText type="title">Spell not found</ThemedText>
          <Pressable onPress={() => router.back()} style={styles.backInline}>
            <Ionicons name="chevron-back" size={20} />
            <ThemedText>Back</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back to spell list"
        >
          <Ionicons name="chevron-back" size={20} />
          <ThemedText>Back</ThemedText>
        </Pressable>
        <Pressable
          onPress={() => toggle(spell)}
          hitSlop={12}
          style={styles.starButton}
          accessibilityRole="button"
          accessibilityLabel={
            inList ? 'Remove from spell list' : 'Add to spell list'
          }
        >
          <Ionicons
            name={inList ? 'star' : 'star-outline'}
            size={26}
            color={inList ? '#fbbf24' : Colors.light.placeholder}
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">{spell.name}</ThemedText>
        <ThemedText style={styles.subtitle}>
          {levelLabel(spell.level)} {spell.school.toLowerCase()}
        </ThemedText>

        <View style={styles.tags}>
          {spell.concentration ? (
            <Tag color="#a855f7">Concentration</Tag>
          ) : null}
          {spell.ritual ? <Tag color="#0ea5e9">Ritual</Tag> : null}
        </View>

        <View style={styles.fields}>
          <Field label="Casting Time" value={spell.castingTime} />
          <Field label="Range" value={spell.range} />
          <Field label="Components" value={spell.components} />
          <Field label="Duration" value={spell.duration} />
          <Field
            label="Classes"
            value={spell.classes.map((c) => CLASS_LABELS[c]).join(', ')}
          />
        </View>

        <ThemedText type="subtitle" style={styles.section}>
          Description
        </ThemedText>
        <ThemedText style={styles.body}>{spell.description}</ThemedText>

        {spell.higherLevel ? (
          <>
            <ThemedText type="subtitle" style={styles.section}>
              At Higher Levels
            </ThemedText>
            <ThemedText style={styles.body}>{spell.higherLevel}</ThemedText>
          </>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  starButton: {
    paddingHorizontal: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: GOBLIN_FAB_CLEARANCE,
    gap: 8,
  },
  subtitle: {
    fontStyle: 'italic',
    opacity: 0.8,
    marginBottom: 4,
  },
  tags: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 4,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  tagLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  fields: {
    gap: 6,
    marginTop: 8,
  },
  field: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  fieldLabel: {
    width: 110,
    opacity: 0.6,
    fontSize: 13,
  },
  fieldValue: {
    flex: 1,
    fontSize: 13,
  },
  section: {
    marginTop: 16,
  },
  body: {
    lineHeight: 22,
  },
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
