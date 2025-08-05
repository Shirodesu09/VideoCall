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
const useEmotionStore = create((set) => ({
  emotionHistory: [], // Array to store all emotion entries
  
  // Function to add a new emotion entry
  addEmotionEntry: (emotionData) => 
    set((state) => ({
      emotionHistory: [...state.emotionHistory, {
        ...emotionData,
        timestamp: new Date().toISOString(), // Add a timestamp
      }],
    })),

  // Optional: Clear history
  clearHistory: () => set({ emotionHistory: [] }),
}));
export { useUserStore, useVideoClientStore, useChatClientStore, usechannelIdStore, useEmotionStore };
