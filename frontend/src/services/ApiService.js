import axios from "axios";
import useAuthStore from "../stores/Auth.js";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== "/auth/refresh") {
            originalRequest._retry = true;
            try {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );
                return api(originalRequest);
            } catch (refreshError) {
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }
        if (originalRequest.url === "/auth/refresh" && error.response?.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export default api;