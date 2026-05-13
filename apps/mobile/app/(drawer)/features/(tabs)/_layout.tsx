import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import type {
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from '@react-navigation/material-top-tabs';
import type {
  ParamListBase,
  TabNavigationState,
} from '@react-navigation/native';
import { withLayoutContext } from 'expo-router';

const { Navigator } = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function FeaturesTabsLayout() {
  return (
    <MaterialTopTabs>
      <MaterialTopTabs.Screen
        name="index"
        options={{ title: 'All Features' }}
      />
      <MaterialTopTabs.Screen
        name="featureList"
        options={{ title: 'My Features' }}
      />
    </MaterialTopTabs>
  );
}
