import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/theme';
import { getMeta, setMeta } from '@/db/queries';
import { useChat } from '@/stores/chat';
import { useUI } from '@/stores/ui';

const DISMISSED_KEY = 'goblin_chat_nudge_dismissed';

export function GoblinChatNudge() {
  const insets = useSafeAreaInsets();
  const chatOpen = useChat((s) => s.open);
  const drawerOpen = useUI((s) => s.drawerOpen);
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    getMeta(DISMISSED_KEY).then((v) => setDismissed(v === '1'));
  }, []);

  useEffect(() => {
    if (chatOpen && dismissed === false) {
      setMeta(DISMISSED_KEY, '1');
      setDismissed(true);
    }
  }, [chatOpen, dismissed]);

  if (dismissed !== false || chatOpen || drawerOpen) return null;

  const dismiss = () => {
    setMeta(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.layer,
        {
          paddingBottom: 120 + insets.bottom,
          paddingRight: 16 + insets.right,
        },
      ]}
    >
      <View style={styles.bubble}>
        <ThemedText style={styles.text}>Need lore or a clever name?</ThemedText>
        <Pressable
          onPress={dismiss}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Dismiss nudge"
          style={styles.closeButton}
        >
          <Ionicons name="close" size={16} color={Colors.text} />
        </Pressable>
        <View style={[styles.tail, styles.tailBorder]} />
        <View style={styles.tail} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
    boxShadow: [
      { offsetX: 0, offsetY: 2, blurRadius: 6, color: 'rgba(0, 0, 0, 0.25)' },
    ],
  },
  text: {
    fontSize: 14,
  },
  closeButton: {
    padding: 4,
  },
  tail: {
    position: 'absolute',
    bottom: -8,
    right: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderLeftColor: 'transparent',
    borderRightWidth: 8,
    borderRightColor: 'transparent',
    borderTopWidth: 10,
    borderTopColor: '#fff',
  },
  tailBorder: {
    bottom: -10,
    right: 19,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderTopWidth: 11,
    borderTopColor: Colors.border,
  },
});
