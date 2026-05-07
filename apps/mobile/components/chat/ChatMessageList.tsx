import { useCallback, useEffect, useMemo, useRef } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { useChat, type ChatMessage } from '@/stores/chat';

import { GoblinGreeting } from './GoblinGreeting';
import { ChatMessageBubble } from './ChatMessageBubble';

const PENDING_MESSAGE: ChatMessage = {
  id: '__pending__',
  role: 'assistant',
  content: '',
  createdAt: 0,
};

function keyExtractor(item: ChatMessage): string {
  return item.id;
}

function isVisibleMessage(m: ChatMessage): boolean {
  if (m.role === 'tool') return false;
  if (
    m.role === 'assistant' &&
    !m.content &&
    m.toolCalls &&
    m.toolCalls.length > 0
  ) {
    return false;
  }
  return true;
}

export function ChatMessageList() {
  const messages = useChat((s) => s.messages);
  const streaming = useChat((s) => s.streaming);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const visibleMessages = useMemo(
    () => messages.filter(isVisibleMessage),
    [messages],
  );

  const last = visibleMessages[visibleMessages.length - 1];
  const showPending = streaming && (!last || last.role !== 'assistant');

  const lastIndex = visibleMessages.length - 1;
  const renderItem = useCallback(
    ({ item, index }: { item: ChatMessage; index: number }) => (
      <ChatMessageBubble message={item} isLast={index === lastIndex} />
    ),
    [lastIndex],
  );

  useEffect(() => {
    if (visibleMessages.length === 0 && !showPending) return;
    const id = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 16);
    return () => clearTimeout(id);
  }, [visibleMessages.length, showPending, streaming]);

  if (visibleMessages.length === 0 && !showPending) {
    return <GoblinGreeting />;
  }

  return (
    <FlatList
      ref={listRef}
      data={visibleMessages}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.content}
      ListFooterComponent={
        showPending ? (
          <ChatMessageBubble message={PENDING_MESSAGE} isLast />
        ) : null
      }
      onContentSizeChange={() => {
        listRef.current?.scrollToEnd({ animated: false });
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: 12,
    flexGrow: 1,
  },
});
