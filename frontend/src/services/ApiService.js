import axios from "axios";
import useAuthStore from "../stores/Auth.js";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    withCredentials: true,
});


api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== "/auth/refresh") {
            originalRequest._retry = true;
            try {
                console.log("Attempting token refresh...");
                await axios.post(
                    "http://localhost:8080/api/auth/refresh",
                    {},
                    { withCredentials: true }
                );
                console.log("Token refresh successful, retrying original request.");
                return api(originalRequest);
            } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
                useAuthStore.getState().logout();
                // --- REMOVE THIS LINE ---
                // window.location.href = "/login";
                // --- --- --- --- --- ---

                // Reject the promise so the original caller knows the request ultimately failed.
                return Promise.reject(refreshError);
            }
        }
        // If it's not a 401, or it's already a retry, or it's the refresh failing, reject the promise.
        // If the refresh call itself fails (e.g. 401 on /auth/refresh), logout.
        if (originalRequest.url === "/auth/refresh" && error.response?.status === 401) {
            console.error("Refresh token is invalid or expired.");
            useAuthStore.getState().logout();
        }

        return Promise.reject(error);
    }
);

export default api;