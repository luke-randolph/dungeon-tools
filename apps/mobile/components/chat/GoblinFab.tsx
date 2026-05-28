import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useChat } from '@/stores/chat';
import { useUI } from '@/stores/ui';

const HEAD_IMAGE = require('@/assets/goblin/goblin-head-only.png');

export function GoblinFab() {
  const insets = useSafeAreaInsets();
  const open = useChat((s) => s.open);
  const setOpen = useChat((s) => s.setOpen);
  const drawerOpen = useUI((s) => s.drawerOpen);

  if (open || drawerOpen) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.layer,
        {
          paddingBottom: 24 + insets.bottom,
          paddingRight: 24 + insets.right,
        },
      ]}
    >
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Open goblin chat"
        style={({ pressed }) => [
          styles.fab,
          {
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.96 : 1 }],
          },
        ]}
      >
        <Image source={HEAD_IMAGE} style={styles.image} contentFit="contain" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  fab: {
    width: 75,
    height: 75,
    borderRadius: '100%',
    backgroundColor: Colors.goldDeep,
    borderWidth: 4,
    borderColor: Colors.goldAccent,
    boxShadow: [
      {
        inset: true,
        offsetX: 0,
        offsetY: 0,
        blurRadius: 16,
        color: 'rgba(0, 0, 0, 0.15)',
      },
      {
        offsetX: 0,
        offsetY: 4,
        blurRadius: 8,
        color: 'rgba(0, 0, 0, 0.35)',
      },
    ],
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 50,
    height: 50,
    // makes image look more vertically centered
    marginTop: 4,
  },
});
