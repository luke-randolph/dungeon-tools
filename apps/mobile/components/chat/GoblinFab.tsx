import { Image } from 'expo-image';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useChat } from '@/stores/chat';
import { useUI } from '@/stores/ui';

const HEAD_IMAGE = require('@/assets/goblin/goblin-head-only.png');

const FAB_SIZE = 80;

export function GoblinFab() {
  const insets = useSafeAreaInsets();
  const open = useChat((s) => s.open);
  const setOpen = useChat((s) => s.setOpen);
  const drawerOpen = useUI((s) => s.drawerOpen);

  if (open || drawerOpen) return null;

  return (
    <View
      style={[
        styles.layer,
        {
          pointerEvents: 'box-none',
          paddingBottom: 24 + insets.bottom,
          paddingRight: 16 + insets.right,
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
            opacity: pressed ? 0.85 : 1,
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
    width: FAB_SIZE,
    height: FAB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        // drop-shadow follows the image's alpha — clean head-shaped shadow.
        filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.35))',
      },
      default: {},
    }),
  },
  image: {
    width: FAB_SIZE,
    height: FAB_SIZE,
  },
});
