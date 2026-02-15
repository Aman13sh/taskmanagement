import axios from "axios";
import { tokenStorage } from "../utils/cookies";
import { store } from "../redux/store";
import { refreshAccessToken, logout } from "../redux/slices/authSlice";

const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies to be sent with requests
});

// Request interceptor to add token from cookies
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Check if we have a refresh token
        const refreshToken = tokenStorage.getRefreshToken();

        if (refreshToken) {
          // Try to refresh the token using Redux action
          const result = await store.dispatch(refreshAccessToken()).unwrap();

          if (result.success) {
            // Get the new access token from cookies
            const newAccessToken = tokenStorage.getAccessToken();

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        tokenStorage.clearAllTokens();

        // Clear Redux state
        await store.dispatch(logout());

        // Use navigation service to redirect (will be handled by React Router)
        // The actual redirect will happen in the component that catches this error
      }
    }

    return Promise.reject(error);
  }
);

export default api;