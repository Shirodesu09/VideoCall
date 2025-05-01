import { create } from 'zustand';

// Define the Zustand store to manage user state
const useUserStore = create((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),  // This function sets the user
}));

export default useUserStore;
