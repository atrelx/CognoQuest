import { create } from "zustand";
import api from "../services/ApiService.js";

const useAuthStore = create((set) => ({
    isAuthenticated: false, // Изначально false, проверяем через бэкенд
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
            const response = await api.get("/auth/check"); // Проверяем авторизацию
            set({ isAuthenticated: true, isLoading: false }); // Если 200, пользователь авторизован
            return true;
        } catch (err) {
            set({ isAuthenticated: false, user: null, isLoading: false}); // Если 401 или ошибка, не авторизован
            return false;
        }
    },
}));

export default useAuthStore;