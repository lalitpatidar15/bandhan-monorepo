import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthUser } from '@/types/auth';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isInitialized: false,
};

function isValidStoredToken(token: string) {
  try {
    const encoded = token.split(".")[1];
    if (!encoded) return false;
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(encoded.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded));
    return !payload.exp || payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: AuthUser; token: string | null }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', action.payload.token ?? '');
        localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
        if (action.payload.token) {
          const secure = window.location.protocol === 'https:' ? '; Secure' : '';
          document.cookie = `bandhan_user_token=${encodeURIComponent(action.payload.token)}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${secure}`;
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        document.cookie = 'bandhan_user_token=; Path=/; Max-Age=0; SameSite=Lax';
      }
    },
    initializeAuth: (state) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        const user = localStorage.getItem('auth_user');
        if (token && user && isValidStoredToken(token)) {
          try {
            state.token = token;
            state.user = JSON.parse(user);
            const secure = window.location.protocol === 'https:' ? '; Secure' : '';
            document.cookie = `bandhan_user_token=${encodeURIComponent(token)}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${secure}`;
          } catch {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
          }
        } else {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      }
      state.isInitialized = true;
    },
  },
});

export const { setCredentials, logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
