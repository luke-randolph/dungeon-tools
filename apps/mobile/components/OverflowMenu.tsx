import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/theme';

export interface OverflowMenuItem {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
  onPress: () => void;
}

interface OverflowMenuProps {
  items: OverflowMenuItem[];
  accessibilityLabel?: string;
  iconColor?: string;
}

const MENU_MIN_WIDTH = 200;
const VIEWPORT_MARGIN = 8;

export function OverflowMenu({
  items,
  accessibilityLabel = 'More actions',
  iconColor = Colors.text,
}: OverflowMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const triggerRef = useRef<View>(null);

  function close() {
    setOpen(false);
  }

  function openMenu() {
    const node = triggerRef.current;
    if (!node) {
      setOpen(true);
      return;
    }
    node.measureInWindow((x, y, w, h) => {
      const viewportWidth = Dimensions.get('window').width;
      const right = Math.max(
        VIEWPORT_MARGIN,
        viewportWidth - (x + w),
      );
      setPosition({ top: y + h + 4, right });
      setOpen(true);
    });
  }

  function handlePress(item: OverflowMenuItem) {
    close();
    item.onPress();
  }

  return (
    <>
      <Pressable
        ref={triggerRef}
        onPress={openMenu}
        hitSlop={8}
        style={styles.trigger}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Ionicons name="ellipsis-vertical" size={20} color={iconColor} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable
          style={styles.backdrop}
          onPress={close}
          accessibilityLabel="Dismiss menu"
        >
          <View
            style={[
              styles.menu,
              {
                top: position?.top ?? 60,
                right: position?.right ?? 12,
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
            {items.map((item) => {
              const color = item.destructive
                ? Colors.destructive
                : Colors.text;
              return (
                <Pressable
                  key={item.label}
                  onPress={() => handlePress(item)}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && styles.menuItemPressed,
                  ]}
                >
                  {item.icon ? (
                    <Ionicons name={item.icon} size={18} color={color} />
                  ) : null}
                  <ThemedText style={[styles.menuItemLabel, { color }]}>
                    {item.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    padding: 4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  menu: {
    position: 'absolute',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingVertical: 6,
    minWidth: MENU_MIN_WIDTH,
    maxWidth: 280,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  menuItemPressed: {
    opacity: 0.6,
  },
  menuItemLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
});
