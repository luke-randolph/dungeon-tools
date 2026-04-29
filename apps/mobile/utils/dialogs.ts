import { create } from 'zustand';

interface BaseDialog {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  showCancel: boolean;
  destructive: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface DialogStore extends BaseDialog {
  open: (config: Omit<BaseDialog, 'visible'>) => void;
  confirm: () => void;
  cancel: () => void;
}

const initialState: BaseDialog = {
  visible: false,
  title: '',
  message: undefined,
  confirmLabel: 'OK',
  cancelLabel: 'Cancel',
  showCancel: false,
  destructive: false,
  onConfirm: undefined,
  onCancel: undefined,
};

export const useDialogStore = create<DialogStore>((set, get) => ({
  ...initialState,
  open: (config) => set({ ...config, visible: true }),
  confirm: () => {
    const { onConfirm } = get();
    set({ visible: false, onConfirm: undefined, onCancel: undefined });
    onConfirm?.();
  },
  cancel: () => {
    const { onCancel } = get();
    set({ visible: false, onConfirm: undefined, onCancel: undefined });
    onCancel?.();
  },
}));

export function showAlert(title: string, message?: string): void {
  useDialogStore.getState().open({
    title,
    message,
    confirmLabel: 'OK',
    cancelLabel: 'Cancel',
    showCancel: false,
    destructive: false,
  });
}

interface ConfirmOptions {
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function showConfirm(
  title: string,
  message: string,
  options: ConfirmOptions,
): void {
  useDialogStore.getState().open({
    title,
    message,
    confirmLabel: options.confirmLabel ?? 'Confirm',
    cancelLabel: options.cancelLabel ?? 'Cancel',
    showCancel: true,
    destructive: options.destructive ?? false,
    onConfirm: options.onConfirm,
    onCancel: options.onCancel,
  });
}
