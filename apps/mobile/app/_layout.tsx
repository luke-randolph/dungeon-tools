import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { ChatPanel } from '@/components/chat/ChatPanel';
import { GoblinFab } from '@/components/chat/GoblinFab';
import { DialogHost } from '@/components/DialogHost';
import { MultiTabNotice } from '@/components/MultiTabNotice';
import { Colors } from '@/constants/theme';
import { isMultiTabError, runMigrations } from '@/db';
import { useCharacters } from '@/stores/characters';

SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  anchor: '(drawer)',
};

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.surface,
    card: Colors.background,
    text: Colors.text,
    primary: Colors.primary,
    border: '#d4c4a0',
    notification: Colors.destructive,
  },
};

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [multiTab, setMultiTab] = useState(false);
  const refreshActive = useCharacters((s) => s.refresh);
  const [fontsLoaded] = useFonts({
    AncientMedium: require('@/assets/fonts/Ancient Medium.ttf'),
  });

  useEffect(() => {
    (async () => {
      try {
        await runMigrations();
        await refreshActive();
      } catch (err) {
        if (isMultiTabError(err)) setMultiTab(true);
      } finally {
        setReady(true);
      }
    })();
  }, [refreshActive]);

  useEffect(() => {
    if (ready && fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready, fontsLoaded]);

  if (!ready || !fontsLoaded) return null;

  if (multiTab) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MultiTabNotice />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={navTheme}>
          <Stack>
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            <Stack.Screen
              name="characters/new"
              options={{ presentation: 'modal', title: 'New Character' }}
            />
          </Stack>
          <DialogHost />
          <ChatPanel />
          <GoblinFab />
          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
