import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDialogStore } from '@/utils/dialogs';

export function DialogHost() {
  const visible = useDialogStore((s) => s.visible);
  const title = useDialogStore((s) => s.title);
  const message = useDialogStore((s) => s.message);
  const confirmLabel = useDialogStore((s) => s.confirmLabel);
  const cancelLabel = useDialogStore((s) => s.cancelLabel);
  const showCancel = useDialogStore((s) => s.showCancel);
  const destructive = useDialogStore((s) => s.destructive);
  const confirm = useDialogStore((s) => s.confirm);
  const cancel = useDialogStore((s) => s.cancel);

  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const palette = isDark ? Colors.dark : Colors.light;

  const cardBg = isDark ? '#1c1c1e' : palette.background;
  const confirmBg = destructive ? palette.destructive : palette.primary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={cancel}
      accessibilityViewIsModal
    >
      <Pressable style={styles.backdrop} onPress={cancel}>
        <View
          style={[styles.card, { backgroundColor: cardBg, borderColor: palette.border }]}
          onStartShouldSetResponder={() => true}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
        >
          <ThemedText type="subtitle" style={styles.title}>
            {title}
          </ThemedText>
          {message ? (
            <ThemedText style={styles.message}>{message}</ThemedText>
          ) : null}
          <View style={styles.actions}>
            {showCancel ? (
              <Pressable
                onPress={cancel}
                style={[styles.button, styles.cancelButton, { borderColor: palette.border }]}
                accessibilityRole="button"
              >
                <ThemedText style={styles.cancelLabel}>{cancelLabel}</ThemedText>
              </Pressable>
            ) : null}
            <Pressable
              onPress={confirm}
              style={[styles.button, styles.confirmButton, { backgroundColor: confirmBg }]}
              accessibilityRole="button"
            >
              <ThemedText style={styles.confirmLabel}>{confirmLabel}</ThemedText>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 18,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.85,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    minWidth: 88,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  confirmButton: {},
  cancelLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  confirmLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
