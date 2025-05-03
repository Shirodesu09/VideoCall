import { create } from 'zustand';

const useUserStore = create((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
}));

const useClientStore = create((set) => ({
  currentClient: null,
  setCurrentClient: (client) => set({ currentClient: client }),
}));

export { useUserStore, useClientStore };
