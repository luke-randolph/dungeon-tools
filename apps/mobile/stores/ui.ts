import { create } from 'zustand';

interface UIStore {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

export const useUI = create<UIStore>((set) => ({
  drawerOpen: false,
  setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
}));
