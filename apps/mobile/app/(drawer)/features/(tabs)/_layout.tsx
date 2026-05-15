import type {
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from '@react-navigation/material-top-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import type {
  ParamListBase,
  TabNavigationState,
} from '@react-navigation/native';
import { withLayoutContext } from 'expo-router';
import { Text } from 'react-native';

import { useCharacters } from '@/stores/characters';

const { Navigator } = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function FeaturesTabsLayout() {
  const character = useCharacters((s) => s.character);
  const featureListLabel = character ? `${character.name}` : 'My Features';

  return (
    <MaterialTopTabs>
      <MaterialTopTabs.Screen
        name="index"
        options={{ title: 'All Features' }}
      />
      <MaterialTopTabs.Screen
        name="featureList"
        options={{
          title: featureListLabel,
          tabBarLabel: ({ color }) => (
            <Text numberOfLines={1} ellipsizeMode="tail" style={{ color }}>
              {featureListLabel}
            </Text>
          ),
        }}
      />
    </MaterialTopTabs>
  );
}
