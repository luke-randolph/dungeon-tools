import { useEffect, useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCharacters } from "@/stores/characters";
import { useChat } from "@/stores/chat";

import { ChatInput } from "./ChatInput";
import { ChatMessageList } from "./ChatMessageList";
import { GoblinAvatar } from "./GoblinAvatar";

const GREETING_MS = 1500;
const AVATAR_SIZE = 128;

export function ChatPanel() {
  const open = useChat((s) => s.open);
  const streaming = useChat((s) => s.streaming);
  const error = useChat((s) => s.error);
  const setOpen = useChat((s) => s.setOpen);
  const setError = useChat((s) => s.setError);
  const init = useChat((s) => s.init);
  const clear = useChat((s) => s.clear);
  const messages = useChat((s) => s.messages);
  const messageCount = messages.length;

  const character = useCharacters((s) => s.character);
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? Colors.dark : Colors.light;

  // Initialize the conversation the first time the panel opens.
  useEffect(() => {
    if (!open) return;
    void init(character?.id ?? null);
  }, [open, character?.id, init]);

  // Greeting plays once per open, then settles. Doesn't replay after streaming.
  const [showingGreeting, setShowingGreeting] = useState(false);
  useEffect(() => {
    if (!open) {
      setShowingGreeting(false);
      return;
    }
    setShowingGreeting(true);
    const id = setTimeout(() => setShowingGreeting(false), GREETING_MS);
    return () => clearTimeout(id);
  }, [open]);

  const lastMessage = messages[messageCount - 1];
  const isStreamingContent =
    streaming &&
    lastMessage?.role === "assistant" &&
    lastMessage.content.length > 0;

  const avatarMode = isStreamingContent
    ? "streaming"
    : streaming
      ? "thinking"
      : showingGreeting
        ? "greeting"
        : "idle";

  const panel = (
    <View
      style={[
        styles.mobilePanel,
        {
          backgroundColor: palette.background,
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 12,
        },
      ]}
    >
      <View style={[styles.header, { borderBottomColor: palette.border }]}>
        <View style={styles.headerActions}>
          {messageCount > 0 ? (
            <Pressable
              onPress={() => void clear()}
              accessibilityRole="button"
              accessibilityLabel="Clear chat history"
              style={({ pressed }) => [
                styles.headerButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <ThemedText
                style={[
                  styles.headerButtonText,
                  { color: palette.destructive },
                ]}
              >
                Clear
              </ThemedText>
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => setOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Close chat"
            style={({ pressed }) => [
              styles.headerButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <ThemedText
              style={[styles.headerButtonText, { color: palette.text }]}
            >
              Close
            </ThemedText>
          </Pressable>
        </View>
      </View>

      {error ? (
        <Pressable
          onPress={() => setError(null)}
          style={[styles.errorBanner, { backgroundColor: palette.destructive }]}
        >
          <ThemedText style={styles.errorText}>
            {error} · tap to dismiss
          </ThemedText>
        </Pressable>
      ) : null}

      <View style={styles.body}>
        <ChatMessageList />
      </View>

      <View style={styles.avatarRow}>
        <GoblinAvatar mode={avatarMode} size={AVATAR_SIZE} />
      </View>

      <ChatInput />
    </View>
  );

  // On web, RN's Modal portals to document.body, which escapes any preview-
  // frame wrapper your dev environment uses. So on web we render an absolutely-
  // positioned overlay View that stays inside the React tree. Native still
  // gets a real Modal for proper system-back / focus handling.
  if (Platform.OS === "web") {
    if (!open) return null;
    return (
      <View
        style={[styles.webOverlay, { backgroundColor: palette.background }]}
      >
        {panel}
      </View>
    );
  }

  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent={false}
      onRequestClose={() => setOpen(false)}
    >
      <View
        style={[styles.fullScreen, { backgroundColor: palette.background }]}
      >
        {panel}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  // Web: absolutely-positioned overlay inside the layout tree (no portal),
  // so the chat stays inside the app's visual area instead of escaping to
  // document.body and floating in the browser-window corner.
  webOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  mobilePanel: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  title: {
    flex: 1,
    fontSize: 16,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  errorBanner: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  errorText: {
    color: "#fff",
    fontSize: 13,
  },
  body: {
    flex: 1,
  },
  avatarRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "flex-start",
  },
});
