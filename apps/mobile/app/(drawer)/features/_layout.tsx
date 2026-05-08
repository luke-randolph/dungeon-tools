import { Stack } from 'expo-router';

export default function FeaturesStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="[key]" />
    </Stack>
  );
}
