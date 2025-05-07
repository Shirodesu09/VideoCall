import { create } from 'zustand';

const useUserStore = create((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
}));

const useVideoClientStore = create((set) => ({
  currentVideoClient: null,
  setCurrentVideoClient: (client) => set({ currentVideoClient: client }),
}));

const useChatClientStore = create((set) => ({
  currentChatClient: null,
  setCurrentChatClient: (client) => set({ currentChatClient: client }),
}));

const usechannelIdStore = create((set) => ({
  channelId: null,  // Consistent naming
  setChannelId: (id) => set({ channelId: id }),  // Consistent naming
}));
export { useUserStore, useVideoClientStore, useChatClientStore, usechannelIdStore };