import { CLASS_LABELS } from '@dungeon-tools/shared';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCharacters } from '@/stores/characters';

export function CharacterChip() {
  const router = useRouter();
  const character = useCharacters((s) => s.character);
  const characters = useCharacters((s) => s.characters);
  const setActive = useCharacters((s) => s.setActive);
  const [open, setOpen] = useState(false);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  function close() {
    setOpen(false);
  }

  async function pick(id: number) {
    close();
    if (id !== character?.id) {
      await setActive(id);
    }
  }

  function addNew() {
    close();
    router.push('/characters/new');
  }

  const triggerLabel = character ? character.name : 'New character';
  const triggerSub = character ? `${CLASS_LABELS[character.class]} ${character.level}` : null;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={styles.chip}
        accessibilityRole="button"
        accessibilityLabel={
          character
            ? `Active character: ${character.name}. Tap to switch.`
            : 'No character. Tap to create one.'
        }
      >
        {!character && <Ionicons name="person-add" size={16} />}
        <View style={styles.text}>
          <ThemedText style={styles.label} numberOfLines={1}>
            {triggerLabel}
          </ThemedText>
          {triggerSub ? (
            <ThemedText style={styles.sub} numberOfLines={1}>
              {triggerSub}
            </ThemedText>
          ) : null}
        </View>
        <Ionicons name="chevron-down" size={14} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable style={styles.backdrop} onPress={close}>
          <View
            style={[
              styles.menu,
              { backgroundColor: isDark ? '#1c1c1e' : '#fff' },
            ]}
            onStartShouldSetResponder={() => true}
          >
            {characters.length > 0 ? (
              characters.map((c) => {
                const active = c.id === character?.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => pick(c.id)}
                    style={({ pressed }) => [
                      styles.menuItem,
                      pressed && styles.menuItemPressed,
                    ]}
                  >
                    <View style={styles.menuItemText}>
                      <ThemedText style={styles.menuItemTitle}>{c.name}</ThemedText>
                      <ThemedText style={styles.menuItemSub}>
                        {CLASS_LABELS[c.class]} {c.level}
                      </ThemedText>
                    </View>
                    {active ? <Ionicons name="checkmark" size={18} color="#3b82f6" /> : null}
                  </Pressable>
                );
              })
            ) : (
              <View style={styles.emptyHint}>
                <ThemedText style={styles.menuItemSub}>No characters yet.</ThemedText>
              </View>
            )}

            <View
              style={[styles.divider, { backgroundColor: isDark ? '#333' : '#eee' }]}
            />

            <Pressable
              onPress={addNew}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
            >
              <Ionicons name="add" size={18} color="#3b82f6" />
              <ThemedText style={[styles.menuItemTitle, { color: Colors.light.tint }]}>
                New character
              </ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginLeft: 8,
    maxWidth: 180,
  },
  text: {
    flexShrink: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  sub: {
    fontSize: 11,
    opacity: 0.7,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingTop: 60,
    paddingHorizontal: 12,
  },
  menu: {
    borderRadius: 12,
    paddingVertical: 6,
    minWidth: 220,
    maxWidth: 320,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  menuItemPressed: {
    opacity: 0.6,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  menuItemSub: {
    fontSize: 12,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  emptyHint: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
});
