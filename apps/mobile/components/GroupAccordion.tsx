import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { StarIcon } from '@/components/StarIcon';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/theme';
import { childDisplayName } from '@/utils/featureDisplay';

interface GroupItem {
  key: string;
  name: string;
  body: string;
}

export interface GroupAccordionProps<T extends GroupItem> {
  parent: T;
  options: T[];
  selectedKeys: ReadonlySet<string>;
  meta: string;
  unlocked: boolean;
  defaultOpen?: boolean;
  onPressOption: (option: T) => void;
  onToggleOption: (option: T) => void;
}

export function GroupAccordion<T extends GroupItem>({
  parent,
  options,
  selectedKeys,
  meta,
  unlocked,
  defaultOpen = false,
  onPressOption,
  onToggleOption,
}: GroupAccordionProps<T>) {
  const [open, setOpen] = useState(defaultOpen);

  // Auto-open when the parent decides this group should be expanded
  // (e.g. a search query matched one of its children).
  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.header, !unlocked && styles.locked]}
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${parent.name}, ${meta}`}
      >
        <View style={styles.headerText}>
          <ThemedText style={styles.parentName}>{parent.name}</ThemedText>
          <ThemedText style={styles.meta}>{meta}</ThemedText>
        </View>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={Colors.text}
        />
      </Pressable>
      {open && (
        <View style={styles.panel}>
          {parent.body ? (
            <ThemedText style={styles.ruleText}>{parent.body}</ThemedText>
          ) : null}
          {options.map((option) => {
            const selected = selectedKeys.has(option.key);
            const optionName = childDisplayName(option);
            return (
              <View key={option.key} style={styles.optionRow}>
                <Pressable
                  style={styles.optionBody}
                  onPress={() => onPressOption(option)}
                  accessibilityRole="button"
                  accessibilityLabel={optionName}
                >
                  <ThemedText style={styles.optionName}>{optionName}</ThemedText>
                </Pressable>
                <Pressable
                  style={styles.starButton}
                  onPress={() => onToggleOption(option)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={
                    selected ? `Remove ${optionName}` : `Choose ${optionName}`
                  }
                >
                  <StarIcon filled={selected} size={22} />
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginHorizontal: 12,
    marginVertical: 8,
    overflow: 'hidden',
    backgroundColor: Colors.groupHeaderBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locked: { opacity: 0.5 },
  headerText: {
    flex: 1,
    gap: 2,
  },
  parentName: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  meta: {
    fontSize: 12,
    opacity: 0.7,
  },
  panel: {
    backgroundColor: Colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  ruleText: {
    fontSize: 13,
    fontStyle: 'italic',
    opacity: 0.75,
    marginBottom: 8,
    lineHeight: 18,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionBody: {
    flex: 1,
    paddingVertical: 10,
  },
  optionName: {
    fontSize: 15,
  },
  starButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
