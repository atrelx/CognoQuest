import { create } from "zustand";
import api from "../services/ApiService.js";

const useAuthStore = create((set) => ({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    login: (userData) => {
        set({ isAuthenticated: true, user: userData, isLoading: false });
    },
    logout: () => {
        set({ isAuthenticated: false, user: null, isLoading: false});
    },
    setUser: (userData) => set({ user: userData }),
    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get("/auth/check");
            set({ isAuthenticated: true, user: response.data, isLoading: false });
            return true;
        } catch {
            set({ isAuthenticated: false, user: null, isLoading: false});
            return false;
        }
    },
}));

export default useAuthStore;