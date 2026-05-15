import type { Spell } from '@dungeon-tools/shared';
import { Pressable, StyleSheet, View } from 'react-native';

import { StarIcon } from '@/components/StarIcon';
import { ThemedText } from '@/components/ThemedText';
import { levelLabel } from '@/utils/levelLabel';

export interface SpellRowProps {
  spell: Spell;
  inList: boolean;
  onPressRow: () => void;
  onToggleStar: () => void;
}

export function SpellRow({
  spell,
  inList,
  onPressRow,
  onToggleStar,
}: SpellRowProps) {
  const level = levelLabel(spell.level, { cantrip: true });

  return (
    <View style={styles.row}>
      <Pressable
        style={styles.body}
        onPress={onPressRow}
        accessibilityRole="button"
        accessibilityLabel={`${spell.name}, ${level}, ${spell.school}`}
      >
        <ThemedText style={styles.name}>{spell.name}</ThemedText>
        <ThemedText style={styles.meta}>
          {level} · {spell.school}
          {spell.concentration ? ' · C' : ''}
          {spell.ritual ? ' · R' : ''}
        </ThemedText>
      </Pressable>
      <Pressable
        style={styles.starButton}
        onPress={onToggleStar}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityState={{ selected: inList }}
        accessibilityLabel={
          inList
            ? `Remove ${spell.name} from list`
            : `Add ${spell.name} to list`
        }
      >
        <StarIcon filled={inList} size={22} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
  },
  meta: {
    fontSize: 12,
    opacity: 0.7,
  },
  starButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
