import { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useChat } from '@/stores/chat';

const INPUT_HEIGHT = 40;

export function ChatInput() {
  const [text, setText] = useState('');
  const streaming = useChat((s) => s.streaming);
  const send = useChat((s) => s.send);

  const scheme = useColorScheme();
  const palette = scheme === 'dark' ? Colors.dark : Colors.light;

  const trimmed = text.trim();
  const canSend = !streaming && trimmed.length > 0;

  const onSend = () => {
    if (!canSend) return;
    const value = trimmed;
    setText('');
    void send(value);
  };

  // On web: Enter sends, Shift+Enter inserts a newline.
  const onKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (Platform.OS !== 'web') return;
    const ne = e.nativeEvent as TextInputKeyPressEventData & {
      shiftKey?: boolean;
      preventDefault?: () => void;
    };
    if (ne.key === 'Enter' && !ne.shiftKey) {
      ne.preventDefault?.();
      onSend();
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: palette.background, borderTopColor: palette.border },
      ]}
    >
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Ask the goblin…"
        placeholderTextColor={palette.placeholder}
        multiline
        editable={!streaming}
        onKeyPress={onKeyPress}
        onSubmitEditing={Platform.OS !== 'web' ? onSend : undefined}
        blurOnSubmit={false}
        style={[
          styles.input,
          {
            color: palette.text,
            backgroundColor: scheme === 'dark' ? '#1c1c1e' : '#fff',
            borderColor: palette.border,
          },
        ]}
      />
      <Pressable
        onPress={onSend}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel="Send message"
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: palette.goblinGreen,
            opacity: pressed && canSend ? 0.85 : !canSend ? 0.5 : 1,
          },
        ]}
      >
        <ThemedText style={styles.buttonText}>Send</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: INPUT_HEIGHT,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  button: {
    height: '100%',
    paddingHorizontal: 16,
    borderRadius: 10,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
