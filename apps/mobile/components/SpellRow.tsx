import type { Spell } from '@dungeon-tools/shared';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface SpellRowProps {
  spell: Spell;
  inList: boolean;
  onPressRow: () => void;
  onToggleStar: () => void;
}

function levelLabel(level: number): string {
  if (level === 0) return 'Cantrip';
  if (level === 1) return '1st level';
  if (level === 2) return '2nd level';
  if (level === 3) return '3rd level';
  return `${level}th level`;
}

export function SpellRow({ spell, inList, onPressRow, onToggleStar }: SpellRowProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const borderColor = isDark ? '#222' : '#eee';

  return (
    <View style={[styles.row, { borderBottomColor: borderColor }]}>
      <Pressable
        style={styles.body}
        onPress={onPressRow}
        accessibilityRole="button"
        accessibilityLabel={`${spell.name}, ${levelLabel(spell.level)}, ${spell.school}`}
      >
        <ThemedText style={styles.name}>{spell.name}</ThemedText>
        <ThemedText style={styles.meta}>
          {levelLabel(spell.level)} · {spell.school}
          {spell.concentration ? ' · C' : ''}
          {spell.ritual ? ' · R' : ''}
        </ThemedText>
      </Pressable>
      <Pressable
        style={styles.starButton}
        onPress={onToggleStar}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={inList ? `Remove ${spell.name} from list` : `Add ${spell.name} to list`}
      >
        <Ionicons
          name={inList ? 'star' : 'star-outline'}
          size={22}
          color={inList ? '#fbbf24' : Colors.light.placeholder}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
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
