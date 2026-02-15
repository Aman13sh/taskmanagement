import Cookies from 'js-cookie';

// Cookie names
const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

// Cookie options for secure storage
const getSecureCookieOptions = (expiresIn?: number) => {
  const baseOptions: Cookies.CookieAttributes = {
    sameSite: 'strict',
    secure: window.location.protocol === 'https:', // Only use secure in production
    path: '/',
  };

  if (expiresIn) {
    baseOptions.expires = new Date(Date.now() + expiresIn);
  }

  return baseOptions;
};

// Token management functions
export const tokenStorage = {
  // Access token management
  setAccessToken: (token: string) => {
    // Access token expires in 15 minutes
    const fifteenMinutes = 15 * 60 * 1000;
    Cookies.set(ACCESS_TOKEN_COOKIE, token, getSecureCookieOptions(fifteenMinutes));
  },

  getAccessToken: (): string | undefined => {
    return Cookies.get(ACCESS_TOKEN_COOKIE);
  },

  removeAccessToken: () => {
    Cookies.remove(ACCESS_TOKEN_COOKIE, { path: '/' });
  },

  // Refresh token management
  setRefreshToken: (token: string) => {
    // Refresh token expires in 7 days
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    Cookies.set(REFRESH_TOKEN_COOKIE, token, getSecureCookieOptions(sevenDays));
  },

  getRefreshToken: (): string | undefined => {
    return Cookies.get(REFRESH_TOKEN_COOKIE);
  },

  removeRefreshToken: () => {
    Cookies.remove(REFRESH_TOKEN_COOKIE, { path: '/' });
  },

  // Clear all auth cookies
  clearAllTokens: () => {
    Cookies.remove(ACCESS_TOKEN_COOKIE, { path: '/' });
    Cookies.remove(REFRESH_TOKEN_COOKIE, { path: '/' });
  },

  // Check if tokens exist
  hasTokens: (): boolean => {
    return !!(Cookies.get(ACCESS_TOKEN_COOKIE) || Cookies.get(REFRESH_TOKEN_COOKIE));
  },

  // Check if access token is expired (basic check)
  isAccessTokenExpired: (): boolean => {
    const token = Cookies.get(ACCESS_TOKEN_COOKIE);
    if (!token) return true;

    try {
      // Decode JWT payload (not verifying signature, just checking expiry)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expiryTime;
    } catch {
      return true;
    }
  },
};

// Helper to get auth headers
export const getAuthHeaders = () => {
  const token = tokenStorage.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};