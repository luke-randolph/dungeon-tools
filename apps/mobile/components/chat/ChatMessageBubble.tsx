import { StyleSheet, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ChatMessage } from '@/stores/chat';

import { LoadingDots } from './LoadingDots';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  /** Only the most recent assistant bubble gets a tail pointing at the goblin avatar below. */
  isLast?: boolean;
}

export function ChatMessageBubble({ message, isLast = false }: ChatMessageBubbleProps) {
  const scheme = useColorScheme();
  const palette = scheme === 'dark' ? Colors.dark : Colors.light;

  const isUser = message.role === 'user';
  const bubbleBg = isUser ? palette.primary : '#fff';
  const bubbleBorder = isUser ? palette.primary : palette.border;
  const textColor = isUser ? '#fff' : '#000';
  const showTail = !isUser && isLast;

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      <View
        style={[
          styles.bubble,
          { backgroundColor: bubbleBg, borderColor: bubbleBorder },
          isUser ? styles.bubbleUser : styles.bubbleAssistant,
        ]}
      >
        {message.content.length > 0 ? (
          <Markdown style={markdownStyles(textColor, palette.border)}>
            {message.content}
          </Markdown>
        ) : (
          <LoadingDots color="#000" />
        )}
        {showTail ? (
          <>
            {/* Border layer (slightly larger, behind the fill) */}
            <View
              style={[
                styles.tail,
                styles.tailBorder,
                { borderTopColor: bubbleBorder },
              ]}
            />
            {/* Fill layer */}
            <View
              style={[styles.tail, { borderTopColor: bubbleBg }]}
            />
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAssistant: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    borderBottomLeftRadius: 16,
  },
  tail: {
    position: 'absolute',
    bottom: -8,
    left: 24,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderLeftColor: 'transparent',
    borderRightWidth: 6,
    borderRightColor: 'transparent',
    borderTopWidth: 8,
  },
  tailBorder: {
    bottom: -10,
    left: 23,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 9,
  },
});

function markdownStyles(textColor: string, borderColor: string) {
  const codeBg = textColor === '#fff' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.06)';
  return {
    body: { color: textColor, fontSize: 15, lineHeight: 22, gap: 10 },
    paragraph: { marginTop: 0, marginBottom: 0, color: textColor },
    strong: { fontWeight: '700' as const, color: textColor },
    em: { fontStyle: 'italic' as const, color: textColor },
    bullet_list: { marginTop: 4, marginBottom: 0 },
    ordered_list: { marginTop: 4, marginBottom: 0 },
    list_item: { marginVertical: 2, color: textColor },
    bullet_list_icon: { color: textColor },
    ordered_list_icon: { color: textColor },
    heading1: { fontSize: 18, fontWeight: '700' as const, color: textColor, marginTop: 4, marginBottom: 4 },
    heading2: { fontSize: 17, fontWeight: '700' as const, color: textColor, marginTop: 4, marginBottom: 4 },
    heading3: { fontSize: 16, fontWeight: '700' as const, color: textColor, marginTop: 4, marginBottom: 4 },
    code_inline: {
      fontFamily: 'monospace',
      fontSize: 14,
      backgroundColor: codeBg,
      color: textColor,
      paddingHorizontal: 4,
      borderRadius: 4,
    },
    code_block: {
      fontFamily: 'monospace',
      fontSize: 13,
      backgroundColor: codeBg,
      color: textColor,
      padding: 8,
      borderRadius: 6,
    },
    fence: {
      fontFamily: 'monospace',
      fontSize: 13,
      backgroundColor: codeBg,
      color: textColor,
      padding: 8,
      borderRadius: 6,
    },
    blockquote: {
      borderLeftWidth: 3,
      borderLeftColor: borderColor,
      paddingLeft: 8,
      marginVertical: 2,
    },
    link: { color: textColor, textDecorationLine: 'underline' as const },
    hr: { backgroundColor: borderColor, height: 1, marginVertical: 6 },
  };
}
