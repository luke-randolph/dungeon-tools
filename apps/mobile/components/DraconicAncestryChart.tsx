import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import draconicAncestryRaw from '@/assets/srd/draconic-ancestry.json';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/theme';

interface DraconicAncestryRow {
  key: string;
  color: string;
  damageType: string;
  breathShape: string;
  saveType: string;
}

const CHART_ROWS = draconicAncestryRaw as readonly DraconicAncestryRow[];

interface GroupItem {
  key: string;
  name: string;
  body: string;
}

export interface DraconicAncestryChartProps<T extends GroupItem> {
  parent: T;
  options: T[];
  selectedKeys: ReadonlySet<string>;
  meta: string;
  unlocked: boolean;
  defaultOpen?: boolean;
  onToggleOption: (option: T) => void;
}

export function DraconicAncestryChart<T extends GroupItem>({
  parent,
  options,
  selectedKeys,
  meta,
  unlocked,
  defaultOpen = false,
  onToggleOption,
}: DraconicAncestryChartProps<T>) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  const optionsByKey = useMemo(
    () => new Map(options.map((o) => [o.key, o])),
    [options],
  );

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
          <View style={styles.tableHeader}>
            <ThemedText style={[styles.headerCell, styles.colorCol]}>
              Color
            </ThemedText>
            <ThemedText style={[styles.headerCell, styles.damageCol]}>
              Damage
            </ThemedText>
            <ThemedText style={[styles.headerCell, styles.breathCol]}>
              Breath
            </ThemedText>
            <ThemedText style={[styles.headerCell, styles.saveCol]}>
              Save
            </ThemedText>
          </View>
          {CHART_ROWS.map((row) => {
            const option = optionsByKey.get(row.key);
            if (!option) return null;
            const selected = selectedKeys.has(row.key);
            return (
              <Pressable
                key={row.key}
                style={[styles.row, selected && styles.rowSelected]}
                onPress={() => onToggleOption(option)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${row.color} dragon: ${row.damageType} damage, ${row.breathShape}, ${row.saveType} save`}
              >
                <ThemedText
                  style={[
                    styles.cell,
                    styles.colorCol,
                    selected && styles.cellSelectedName,
                  ]}
                >
                  {row.color}
                </ThemedText>
                <ThemedText style={[styles.cell, styles.damageCol]}>
                  {row.damageType}
                </ThemedText>
                <ThemedText style={[styles.cell, styles.breathCol]}>
                  {row.breathShape}
                </ThemedText>
                <ThemedText style={[styles.cell, styles.saveCol]}>
                  {row.saveType}
                </ThemedText>
              </Pressable>
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
  headerText: { flex: 1, gap: 2 },
  parentName: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  meta: { fontSize: 12, opacity: 0.7 },
  panel: {
    backgroundColor: Colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  ruleText: {
    fontSize: 13,
    fontStyle: 'italic',
    opacity: 0.75,
    marginBottom: 12,
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerCell: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.rowBorder,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  rowSelected: {
    backgroundColor: 'rgba(58,42,102,0.08)',
    borderLeftColor: Colors.primary,
  },
  cell: { fontSize: 14 },
  cellSelectedName: { fontWeight: '700' },
  colorCol: { flex: 1.0 },
  damageCol: { flex: 1.2 },
  breathCol: { flex: 1.7 },
  saveCol: { flex: 0.7 },
});
