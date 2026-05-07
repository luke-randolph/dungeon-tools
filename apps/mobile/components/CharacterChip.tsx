import { CLASS_LABELS } from "@dungeon-tools/shared";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Dimensions, Modal, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCharacters } from "@/stores/characters";

const MENU_MIN_WIDTH = 220;
const VIEWPORT_MARGIN = 8;

export function CharacterChip() {
  const router = useRouter();
  const character = useCharacters((s) => s.character);
  const characters = useCharacters((s) => s.characters);
  const setActive = useCharacters((s) => s.setActive);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const triggerRef = useRef<View>(null);
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const palette = Colors[isDark ? "dark" : "light"];

  function close() {
    setOpen(false);
  }

  function openMenu() {
    const node = triggerRef.current;
    if (!node) {
      setOpen(true);
      return;
    }
    node.measureInWindow((x, y, _w, h) => {
      const viewportWidth = Dimensions.get("window").width;
      const clampedLeft = Math.max(
        VIEWPORT_MARGIN,
        Math.min(x, viewportWidth - MENU_MIN_WIDTH - VIEWPORT_MARGIN),
      );
      setPosition({ top: y + h + 4, left: clampedLeft });
      setOpen(true);
    });
  }

  async function pick(id: number) {
    close();
    if (id !== character?.id) {
      await setActive(id);
    }
  }

  function addNew() {
    close();
    router.push("/characters/new");
  }

  const triggerLabel = character ? character.name : "New character";
  const triggerSub = character
    ? `${CLASS_LABELS[character.class]} ${character.level}`
    : null;

  return (
    <>
      <Pressable
        ref={triggerRef}
        onPress={openMenu}
        style={styles.chip}
        accessibilityRole="button"
        accessibilityLabel={
          character
            ? `Active character: ${character.name}. Tap to switch.`
            : "No character. Tap to create one."
        }
      >
        {!character && (
          <Ionicons name="person-add" size={16} color={palette.surfaceText} />
        )}
        <View style={styles.text}>
          <ThemedText
            style={[styles.label, { color: palette.surfaceText }]}
            numberOfLines={1}
          >
            {triggerLabel}
          </ThemedText>
          {triggerSub ? (
            <ThemedText
              style={[styles.sub, { color: palette.surfaceText }]}
              numberOfLines={1}
            >
              {triggerSub}
            </ThemedText>
          ) : null}
        </View>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={14}
          color={palette.surfaceText}
        />
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
              {
                backgroundColor: palette.surface,
                top: position?.top ?? 60,
                left: position?.left ?? 12,
              },
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
                      <ThemedText
                        style={[
                          styles.menuItemTitle,
                          { color: palette.surfaceText },
                        ]}
                      >
                        {c.name}
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.menuItemSub,
                          { color: palette.surfaceText },
                        ]}
                      >
                        {CLASS_LABELS[c.class]} {c.level}
                      </ThemedText>
                    </View>
                    {active ? (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={palette.accent}
                      />
                    ) : null}
                  </Pressable>
                );
              })
            ) : (
              <View style={styles.emptyHint}>
                <ThemedText
                  style={[styles.menuItemSub, { color: palette.surfaceText }]}
                >
                  No characters yet.
                </ThemedText>
              </View>
            )}

            <View style={styles.divider} />

            <Pressable
              onPress={addNew}
              style={({ pressed }) => [
                styles.menuItem,
                styles.newCharacterButton,
                pressed && styles.menuItemPressed,
              ]}
            >
              <Ionicons name="add" size={18} color={palette.accent} />
              <ThemedText
                style={[styles.newCharacterTitle, { color: palette.accent }]}
              >
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
    flexDirection: "row",
    alignItems: "flex-start",
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
    fontWeight: "600",
    lineHeight: 14,
  },
  sub: {
    fontSize: 11,
    opacity: 0.7,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  menu: {
    position: "absolute",
    borderRadius: 12,
    paddingVertical: 6,
    minWidth: MENU_MIN_WIDTH,
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "flex-start",
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
    fontWeight: "500",
    lineHeight: 15,
  },
  newCharacterButton: {
    alignItems: "center",
  },
  newCharacterTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  menuItemSub: {
    fontSize: 12,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    marginVertical: 4,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  emptyHint: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
});
