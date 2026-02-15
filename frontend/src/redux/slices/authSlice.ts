import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { tokenStorage } from '../../utils/cookies';
import axios from 'axios';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  name: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        'http://localhost:3000/auth/login',
        credentials
      );

      const { userId, name, email, accessToken, refreshToken } = response.data;

      // Store tokens in cookies
      tokenStorage.setAccessToken(accessToken);
      tokenStorage.setRefreshToken(refreshToken);

      // Create user object from response
      const user = { id: userId, name, email };

      return { user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        'http://localhost:3000/auth/register',
        credentials
      );

      const { userId, name, email, accessToken, refreshToken } = response.data;

      // Store tokens in cookies if they exist
      if (accessToken && refreshToken) {
        tokenStorage.setAccessToken(accessToken);
        tokenStorage.setRefreshToken(refreshToken);
      }

      // Create user object from response
      const user = { id: userId, name, email };

      return { user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post<{ accessToken: string; refreshToken: string }>(
        'http://localhost:3000/auth/refresh',
        { refreshToken }
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      // Update tokens in cookies
      tokenStorage.setAccessToken(accessToken);
      tokenStorage.setRefreshToken(newRefreshToken);

      return { success: true };
    } catch (error: any) {
      // Clear tokens on refresh failure
      tokenStorage.clearAllTokens();
      return rejectWithValue(error.response?.data?.message || 'Token refresh failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = tokenStorage.getAccessToken();

      if (!token) {
        throw new Error('No access token available');
      }

      const response = await axios.get<{ user: User }>(
        'http://localhost:3000/auth/me',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      return { user: response.data.user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();

      if (refreshToken) {
        // Call logout endpoint to invalidate refresh token on server
        await axios.post('http://localhost:3000/auth/logout', { refreshToken });
      }

      // Clear tokens from cookies
      tokenStorage.clearAllTokens();

      return { success: true };
    } catch (error: any) {
      // Clear tokens even if server call fails
      tokenStorage.clearAllTokens();
      return { success: true };
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    checkAuthStatus: (state) => {
      // Check if we have valid tokens in cookies
      const hasTokens = tokenStorage.hasTokens();
      const isExpired = tokenStorage.isAccessTokenExpired();

      if (hasTokens && !isExpired) {
        state.isAuthenticated = true;
      } else if (hasTokens && isExpired) {
        // Token expired but refresh token might be valid
        // This will trigger a refresh attempt
        state.isAuthenticated = false;
      } else {
        state.isAuthenticated = false;
        state.user = null;
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      });

    // Refresh token
    builder
      .addCase(refreshAccessToken.fulfilled, (state) => {
        // Token refreshed successfully, maintain auth state
        state.error = null;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        // Token refresh failed, log out user
        state.isAuthenticated = false;
        state.user = null;
        state.error = 'Session expired. Please log in again.';
      });

    // Get current user
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      });

    // Logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

// Export actions and reducer
export const { clearError, setUser, checkAuthStatus } = authSlice.actions;
export default authSlice.reducer;