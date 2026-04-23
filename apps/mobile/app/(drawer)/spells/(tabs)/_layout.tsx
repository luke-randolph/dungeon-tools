import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import type {
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from '@react-navigation/material-top-tabs';
import type { ParamListBase, TabNavigationState } from '@react-navigation/native';
import { spellListLabel } from '@dungeon-tools/shared';
import { withLayoutContext } from 'expo-router';

import { useCharacters } from '@/stores/characters';

const { Navigator } = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function SpellsTabsLayout() {
  const character = useCharacters((s) => s.character);

  return (
    <MaterialTopTabs>
      <MaterialTopTabs.Screen name="index" options={{ title: 'All Spells' }} />
      <MaterialTopTabs.Screen
        name="spellList"
        options={{ title: spellListLabel(character?.class) }}
      />
    </MaterialTopTabs>
  );
}
