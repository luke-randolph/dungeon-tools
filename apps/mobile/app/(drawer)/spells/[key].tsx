import { CLASS_LABELS } from '@dungeon-tools/shared';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { DetailHeader } from '@/components/DetailHeader';
import { Field } from '@/components/Field';
import { NotFound } from '@/components/NotFound';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { GOBLIN_FAB_CLEARANCE } from '@/constants/layout';
import { Colors } from '@/constants/theme';
import { getSpell } from '@/data/spells';
import { useToggleSpell } from '@/hooks/useToggleSpell';
import { useSpellList } from '@/stores/spellList';
import { levelLabel } from '@/utils/levelLabel';

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
    return <NotFound title="Spell not found" onBack={() => router.back()} />;
  }

  return (
    <ThemedView style={styles.container}>
      <DetailHeader
        onBack={() => router.back()}
        backAccessibilityLabel="Back to spell list"
        starFilled={inList}
        onToggleStar={() => toggle(spell)}
        starAccessibilityLabel={
          inList ? 'Remove from spell list' : 'Add to spell list'
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">{spell.name}</ThemedText>
        <ThemedText style={styles.subtitle}>
          {levelLabel(spell.level, { cantrip: true, hyphenated: true })}{' '}
          {spell.school.toLowerCase()}
        </ThemedText>

        <View style={styles.tags}>
          {spell.concentration ? (
            <Tag color={Colors.concentration}>Concentration</Tag>
          ) : null}
          {spell.ritual ? <Tag color={Colors.ritual}>Ritual</Tag> : null}
        </View>

        <View style={styles.fields}>
          <Field
            label="Casting Time"
            value={spell.castingTime}
            labelWidth={110}
            compact
          />
          <Field label="Range" value={spell.range} labelWidth={110} compact />
          <Field
            label="Components"
            value={spell.components}
            labelWidth={110}
            compact
          />
          <Field
            label="Duration"
            value={spell.duration}
            labelWidth={110}
            compact
          />
          <Field
            label="Classes"
            value={spell.classes.map((c) => CLASS_LABELS[c]).join(', ')}
            labelWidth={110}
            compact
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
  section: {
    marginTop: 16,
  },
  body: {
    lineHeight: 22,
  },
});
