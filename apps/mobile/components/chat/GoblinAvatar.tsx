import { Image } from 'expo-image';
import { Asset } from 'expo-asset';
import { useEffect, useState } from 'react';
import { type ImageStyle, type StyleProp } from 'react-native';

const FRAMES = {
  default: require('@/assets/goblin/goblin-default.png'),
  speakClosed: require('@/assets/goblin/goblin-speak-closed.png'),
  speakOpen1: require('@/assets/goblin/goblin-speak-open-1.png'),
  speakOpen2: require('@/assets/goblin/goblin-speak-open-2.png'),
  winkWave: require('@/assets/goblin/goblin-wink-wave.png'),
  thinking1: require('@/assets/goblin/goblin-thinking-1.png'),
  thinking2: require('@/assets/goblin/goblin-thinking-2.png'),
  thinking3: require('@/assets/goblin/goblin-thinking-3.png'),
  reading1: require('@/assets/goblin/goblin-reading-1.png'),
  reading2: require('@/assets/goblin/goblin-reading-2.png'),
  reading3: require('@/assets/goblin/goblin-reading-3.png'),
} as const;

const SPEAK_CYCLE = [
  FRAMES.speakOpen1,
  FRAMES.speakClosed,
  FRAMES.speakOpen2,
  FRAMES.speakClosed,
] as const;

const READING_SEQUENCE = [
  FRAMES.reading1,
  FRAMES.reading2,
  FRAMES.reading3,
  FRAMES.reading1,
  FRAMES.reading2,
  FRAMES.reading3,
] as const;

const SPEAK_FRAME_MS = 140;
const THINKING_FRAME_MS = 500;
const T3_PROBABILITY = 0.25;
const READING_PROBABILITY = 0.1;

type Mode = 'idle' | 'streaming' | 'greeting' | 'thinking';

interface GoblinAvatarProps {
  mode: Mode;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

/**
 * Renders the goblin in one of four modes. The parent owns mode timing —
 * including how long `greeting` lasts before reverting to `idle`.
 */
export function GoblinAvatar({ mode, size = 96, style }: GoblinAvatarProps) {
  const [speakFrame, setSpeakFrame] = useState(0);
  const [thinkingFrame, setThinkingFrame] = useState<number>(FRAMES.thinking1);

  useEffect(() => {
    Asset.loadAsync(Object.values(FRAMES));
  }, []);

  useEffect(() => {
    if (mode !== 'streaming') return;
    const id = setInterval(() => {
      setSpeakFrame((i) => (i + 1) % SPEAK_CYCLE.length);
    }, SPEAK_FRAME_MS);
    return () => clearInterval(id);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'thinking') return;

    // Local state for the thinking state machine.
    let readingQueue: number[] = [];
    // 0 = next base frame is T1 (or sometimes T3); 1 = next is T2.
    let baseStep: 0 | 1 = 0;

    const tick = () => {
      if (readingQueue.length > 0) {
        const next = readingQueue.shift();
        if (next !== undefined) setThinkingFrame(next);
        return;
      }
      if (baseStep === 0) {
        setThinkingFrame(
          Math.random() < T3_PROBABILITY ? FRAMES.thinking3 : FRAMES.thinking1,
        );
        baseStep = 1;
      } else {
        setThinkingFrame(FRAMES.thinking2);
        baseStep = 0;
        if (Math.random() < READING_PROBABILITY) {
          readingQueue = [...READING_SEQUENCE];
        }
      }
    };

    tick();
    const id = setInterval(tick, THINKING_FRAME_MS);
    return () => clearInterval(id);
  }, [mode]);

  const source =
    mode === 'streaming'
      ? SPEAK_CYCLE[speakFrame]
      : mode === 'greeting'
        ? FRAMES.winkWave
        : mode === 'thinking'
          ? thinkingFrame
          : FRAMES.default;

  return (
    <Image
      source={source}
      style={[{ width: size, height: size }, style]}
      contentFit="contain"
    />
  );
}
