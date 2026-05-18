import { Asset } from 'expo-asset';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { type ImageStyle, type StyleProp } from 'react-native';

const FRAMES = {
  default: require('@/assets/goblin/portrait/goblin-default.png'),
  blink: require('@/assets/goblin/portrait/blink.png'),
  speakClosed: require('@/assets/goblin/portrait/goblin-speak-closed.png'),
  speakOpen1: require('@/assets/goblin/portrait/goblin-speak-open-1.png'),
  speakOpen2: require('@/assets/goblin/portrait/goblin-speak-open-2.png'),
  winkWave: require('@/assets/goblin/portrait/goblin-wink-wave.png'),
  thinking1: require('@/assets/goblin/portrait/goblin-thinking-1.png'),
  thinking2: require('@/assets/goblin/portrait/goblin-thinking-2.png'),
  thinking3: require('@/assets/goblin/portrait/goblin-thinking-3.png'),
  reading1: require('@/assets/goblin/portrait/goblin-reading-1.png'),
  reading2: require('@/assets/goblin/portrait/goblin-reading-2.png'),
  reading3: require('@/assets/goblin/portrait/goblin-reading-3.png'),
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

const SPEAK_FRAME_MS = 120;
const THINKING_FRAME_MS = 500;
const READING_FRAME_MS = 700;
const READING_PROBABILITY = 0.33;

const BLINK_DURATION_MS = 300;
const BLINK_MIN_GAP_MS = 3000;
const BLINK_MAX_GAP_MS = 6000;

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
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    Asset.loadAsync(Object.values(FRAMES));
  }, []);

  // While idle, blink at random intervals: shut the eyes briefly, then reopen.
  useEffect(() => {
    if (mode !== 'idle') {
      setBlinking(false);
      return;
    }

    let openId: ReturnType<typeof setTimeout>;
    let scheduleId: ReturnType<typeof setTimeout>;

    const scheduleBlink = () => {
      const gap =
        BLINK_MIN_GAP_MS +
        Math.random() * (BLINK_MAX_GAP_MS - BLINK_MIN_GAP_MS);
      scheduleId = setTimeout(() => {
        setBlinking(true);
        openId = setTimeout(() => {
          setBlinking(false);
          scheduleBlink();
        }, BLINK_DURATION_MS);
      }, gap);
    };

    scheduleBlink();
    return () => {
      clearTimeout(scheduleId);
      clearTimeout(openId);
    };
  }, [mode]);

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
    // 0 = next base frame is T1; 1 = next is T2.
    let baseStep: 0 | 1 = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    // Each frame declares how long it stays up, so the reading sequence can
    // run slower than the base T1/T2 rhythm.
    const tick = () => {
      let frameMs: number;
      if (readingQueue.length > 0) {
        const next = readingQueue.shift();
        if (next !== undefined) setThinkingFrame(next);
        frameMs = READING_FRAME_MS;
      } else if (baseStep === 0) {
        setThinkingFrame(FRAMES.thinking1);
        baseStep = 1;
        frameMs = THINKING_FRAME_MS;
      } else {
        setThinkingFrame(FRAMES.thinking2);
        baseStep = 0;
        if (Math.random() < READING_PROBABILITY) {
          readingQueue = [...READING_SEQUENCE];
        }
        frameMs = THINKING_FRAME_MS;
      }
      timeoutId = setTimeout(tick, frameMs);
    };

    tick();
    return () => clearTimeout(timeoutId);
  }, [mode]);

  const source =
    mode === 'streaming'
      ? SPEAK_CYCLE[speakFrame]
      : mode === 'greeting'
        ? FRAMES.winkWave
        : mode === 'thinking'
          ? thinkingFrame
          : blinking
            ? FRAMES.blink
            : FRAMES.default;

  return (
    <Image
      source={source}
      style={[{ width: size, height: size }, style]}
      contentFit="contain"
      // Decorative — the goblin's pose is flavour; the chat bubbles and their
      // live regions carry the actual content for screen readers.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
