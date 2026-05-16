import { StyleSheet, View } from 'react-native';

import type { ChatMessage } from '@/stores/chat';

import { ChatMessageBubble } from './ChatMessageBubble';

const GREETING: ChatMessage = {
  id: '__greeting__',
  role: 'assistant',
  content: 'Greetings, traveller! What lore can I dig up for ye?',
  createdAt: 0,
};

export function GoblinGreeting() {
  return (
    <View style={styles.container}>
      <ChatMessageBubble message={GREETING} isLast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
});
