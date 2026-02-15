import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { checkAuthStatus, getCurrentUser, refreshAccessToken } from '../redux/slices/authSlice';
import { tokenStorage } from '../utils/cookies';

/**
 * Custom hook to manage authentication state
 * Checks for existing tokens on mount and attempts to refresh/fetch user data
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (initialized.current) return;
    initialized.current = true;

    const initializeAuth = async () => {
      const accessToken = tokenStorage.getAccessToken();
      const refreshToken = tokenStorage.getRefreshToken();

      if (accessToken && !tokenStorage.isAccessTokenExpired()) {
        // Access token is valid, fetch current user
        try {
          await dispatch(getCurrentUser()).unwrap();
        } catch (error) {
          console.error('Failed to fetch current user:', error);
        }
      } else if (refreshToken) {
        // Access token is expired but we have refresh token
        try {
          await dispatch(refreshAccessToken()).unwrap();
          // After successful refresh, get current user
          await dispatch(getCurrentUser()).unwrap();
        } catch (error) {
          console.error('Failed to refresh token:', error);
          // Tokens are invalid, they will be cleared by the action
        }
      }
      // If no tokens, user remains logged out
      // Check auth status after async operations complete
      dispatch(checkAuthStatus());
    };

    initializeAuth();
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
  };
};

/**
 * Hook to get just the authentication status without initialization
 */
export const useAuthStatus = () => {
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  return {
    user,
    isAuthenticated,
    isLoading,
  };
};