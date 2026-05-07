import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  type ColorValue,
} from 'react-native';

const DOT_COUNT = 3;
const PHASE_OFFSET_MS = 180;
const HALF_PERIOD_MS = 360;
const DOT_RISE_PX = 4;

interface LoadingDotsProps {
  color?: ColorValue;
  size?: number;
}

export function LoadingDots({ color = '#000', size = 6 }: LoadingDotsProps) {
  const values = useRef(
    Array.from({ length: DOT_COUNT }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const animations = values.map((val, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * PHASE_OFFSET_MS),
          Animated.timing(val, {
            toValue: 1,
            duration: HALF_PERIOD_MS,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: HALF_PERIOD_MS,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [values]);

  return (
    <View style={[styles.row, { height: size + DOT_RISE_PX + 2 }]}>
      {values.map((val, i) => (
        <Animated.View
          key={i}
          style={[
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              transform: [
                {
                  translateY: val.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -DOT_RISE_PX],
                  }),
                },
              ],
              opacity: val.interpolate({
                inputRange: [0, 1],
                outputRange: [0.35, 1],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
  },
});
