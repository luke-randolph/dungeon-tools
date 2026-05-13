import { Ionicons } from '@expo/vector-icons';
import {
  DrawerContentScrollView,
  DrawerItemList,
  useDrawerStatus,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CharacterChip } from '@/components/CharacterChip';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUI } from '@/stores/ui';

function DrawerContent(props: DrawerContentComponentProps) {
  const scheme = useColorScheme();
  const palette = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const status = useDrawerStatus();
  const setDrawerOpen = useUI((s) => s.setDrawerOpen);

  useEffect(() => {
    if (status === 'open') {
      setDrawerOpen(true);
      return;
    }
    const timeout = setTimeout(() => setDrawerOpen(false), 200);
    return () => clearTimeout(timeout);
  }, [status, setDrawerOpen]);

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContent}
    >
      <View style={[styles.drawerHeader, { paddingTop: 16 + insets.top }]}>
        <ThemedText type="defaultSemiBold" style={{ color: palette.accent }}>
          Dungeon Tools 5e
        </ThemedText>
        <Pressable
          onPress={() => props.navigation.closeDrawer()}
          hitSlop={12}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close menu"
        >
          <Ionicons name="close" size={22} color={palette.surfaceText} />
        </Pressable>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  const scheme = useColorScheme();
  const palette = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        drawerPosition: 'right',
        headerLeft: () => <CharacterChip />,
        headerTitle: () => null,
        headerStyle: {
          backgroundColor: palette.surface,
          borderBottomWidth: 2,
          borderBottomColor: '#000',
        },
        headerTintColor: palette.surfaceText,
        headerLeftContainerStyle: { paddingTop: 8 },
        headerRightContainerStyle: { paddingTop: 8, paddingRight: 4 },
        drawerStyle: { backgroundColor: palette.surface },
        drawerActiveTintColor: palette.surfaceText,
        drawerInactiveTintColor: palette.surfaceText,
        drawerActiveBackgroundColor: 'rgba(255,255,255,0.08)',
        drawerLabelStyle: { fontSize: 16, fontWeight: '500' },
        drawerItemStyle: { paddingVertical: 6, marginVertical: 2 },
      }}
    >
      <Drawer.Screen
        name="character"
        options={{
          title: 'Character',
          drawerLabel: 'Character',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="spells"
        options={{
          title: 'Spells',
          drawerLabel: 'Spells',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="sparkles-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="features"
        options={{
          title: 'Class Features',
          drawerLabel: 'Class Features',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="ribbon-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="traits"
        options={{
          title: 'Traits',
          drawerLabel: 'Traits',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="leaf-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="dice"
        options={{
          title: 'Dice',
          drawerLabel: 'Dice',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="dice-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: 'Settings',
          drawerLabel: 'Settings',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    paddingTop: 0,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  closeButton: {
    padding: 4,
  },
});
