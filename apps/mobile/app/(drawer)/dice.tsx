import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Asset } from 'expo-asset';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

const AnimatedImage = Animated.createAnimatedComponent(Image);

const DICE = {
  d4: {
    1: require('@/assets/dice/d4/d4-1.png'),
    2: require('@/assets/dice/d4/d4-2.png'),
    3: require('@/assets/dice/d4/d4-3.png'),
    4: require('@/assets/dice/d4/d4-4.png'),
  },
  d6: {
    1: require('@/assets/dice/d6/d6-1.png'),
    2: require('@/assets/dice/d6/d6-2.png'),
    3: require('@/assets/dice/d6/d6-3.png'),
    4: require('@/assets/dice/d6/d6-4.png'),
    5: require('@/assets/dice/d6/d6-5.png'),
    6: require('@/assets/dice/d6/d6-6.png'),
  },
  d8: {
    1: require('@/assets/dice/d8/d8-1.png'),
    2: require('@/assets/dice/d8/d8-2.png'),
    3: require('@/assets/dice/d8/d8-3.png'),
    4: require('@/assets/dice/d8/d8-4.png'),
    5: require('@/assets/dice/d8/d8-5.png'),
    6: require('@/assets/dice/d8/d8-6.png'),
    7: require('@/assets/dice/d8/d8-7.png'),
    8: require('@/assets/dice/d8/d8-8.png'),
  },
  d10: {
    1: require('@/assets/dice/d10/d10-1.png'),
    2: require('@/assets/dice/d10/d10-2.png'),
    3: require('@/assets/dice/d10/d10-3.png'),
    4: require('@/assets/dice/d10/d10-4.png'),
    5: require('@/assets/dice/d10/d10-5.png'),
    6: require('@/assets/dice/d10/d10-6.png'),
    7: require('@/assets/dice/d10/d10-7.png'),
    8: require('@/assets/dice/d10/d10-8.png'),
    9: require('@/assets/dice/d10/d10-9.png'),
    10: require('@/assets/dice/d10/d10-10.png'),
  },
  d20: {
    1: require('@/assets/dice/d20/d20-1.png'),
    2: require('@/assets/dice/d20/d20-2.png'),
    3: require('@/assets/dice/d20/d20-3.png'),
    4: require('@/assets/dice/d20/d20-4.png'),
    5: require('@/assets/dice/d20/d20-5.png'),
    6: require('@/assets/dice/d20/d20-6.png'),
    7: require('@/assets/dice/d20/d20-7.png'),
    8: require('@/assets/dice/d20/d20-8.png'),
    9: require('@/assets/dice/d20/d20-9.png'),
    10: require('@/assets/dice/d20/d20-10.png'),
    11: require('@/assets/dice/d20/d20-11.png'),
    12: require('@/assets/dice/d20/d20-12.png'),
    13: require('@/assets/dice/d20/d20-13.png'),
    14: require('@/assets/dice/d20/d20-14.png'),
    15: require('@/assets/dice/d20/d20-15.png'),
    16: require('@/assets/dice/d20/d20-16.png'),
    17: require('@/assets/dice/d20/d20-17.png'),
    18: require('@/assets/dice/d20/d20-18.png'),
    19: require('@/assets/dice/d20/d20-19.png'),
    20: require('@/assets/dice/d20/d20-20.png'),
  },
} as const;

type DieKey = keyof typeof DICE;

const DICE_ORDER: DieKey[] = ['d4', 'd6', 'd8', 'd10', 'd20'];
const SIDES: Record<DieKey, number> = { d4: 4, d6: 6, d8: 8, d10: 10, d20: 20 };

export default function DiceScreen() {
  const [values, setValues] = useState<Record<DieKey, number>>({
    d4: 4,
    d6: 6,
    d8: 8,
    d10: 10,
    d20: 20,
  });

  const tint = useThemeColor({}, 'tint');
  const background = useThemeColor({}, 'background');
  const border = useThemeColor({}, 'border');

  useEffect(() => {
    const modules = DICE_ORDER.flatMap((die) => Object.values(DICE[die]));
    Asset.loadAsync(modules);
  }, []);

  const roll = (die: DieKey) => {
    setValues((prev) => ({
      ...prev,
      [die]: Math.floor(Math.random() * SIDES[die]) + 1,
    }));
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title">Dice</ThemedText>
        <View style={styles.grid}>
          {DICE_ORDER.map((die) => (
            <DieTile
              key={die}
              die={die}
              value={values[die]}
              onRoll={roll}
              tint={tint}
              background={background}
              border={border}
            />
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

type DieTileProps = {
  die: DieKey;
  value: number;
  onRoll: (die: DieKey) => void;
  tint: string;
  background: string;
  border: string;
};

function DieTile({ die, value, onRoll, tint, background, border }: DieTileProps) {
  const opacity = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const source = DICE[die][value as keyof (typeof DICE)[typeof die]];

  const handlePress = () => {
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: 220 });
    onRoll(die);
  };

  return (
    <View style={[styles.tile, { borderColor: border }]}>
      <AnimatedImage source={source} style={[styles.image, animatedStyle]} contentFit="contain" />
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: tint, opacity: pressed ? 0.75 : 1 },
        ]}>
        <ThemedText
          type="defaultSemiBold"
          style={[styles.buttonText, { color: background }]}>
          Roll D{SIDES[die]}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    gap: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  tile: {
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    minWidth: 140,
  },
  image: {
    width: 96,
    height: 96,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    textAlign: 'center',
  },
});
