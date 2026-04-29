import { Ionicons } from '@expo/vector-icons';
import {
  DrawerContentScrollView,
  DrawerItemList,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CharacterChip } from '@/components/CharacterChip';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function DrawerContent(props: DrawerContentComponentProps) {
  const scheme = useColorScheme();
  const iconColor = Colors[scheme === 'dark' ? 'dark' : 'light'].text;
  const insets = useSafeAreaInsets();

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContent}
    >
      <View style={[styles.drawerHeader, { paddingTop: 16 + insets.top }]}>
        <ThemedText type="defaultSemiBold">Dungeon Tools</ThemedText>
        <Pressable
          onPress={() => props.navigation.closeDrawer()}
          hitSlop={12}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close menu"
        >
          <Ionicons name="close" size={22} color={iconColor} />
        </Pressable>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        drawerPosition: 'right',
        headerLeft: () => <CharacterChip />,
        headerTitle: () => null,
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
        name="feats"
        options={{
          title: 'Feats',
          drawerLabel: 'Feats',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="ribbon-outline" color={color} size={size} />
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
