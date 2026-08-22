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

function userFromToken(token: string): AuthUser | null {
  try {
    const encoded = token.split(".")[1];
    if (!encoded) return null;
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(encoded.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded));
    const id = payload.id || payload._id || payload.userId || payload.sub;
    if (!id) return null;
    return { id: String(id), name: String(payload.name || payload.fullName || payload.email || 'Bandhan user'), email: payload.email ? String(payload.email) : undefined, role: payload.role ? String(payload.role) : 'user' };
  } catch { return null; }
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
        if (token && isValidStoredToken(token)) {
          try {
            state.token = token;
            state.user = user ? JSON.parse(user) : userFromToken(token);
            if (!state.user) throw new Error('Session is missing user information');
            localStorage.setItem('auth_user', JSON.stringify(state.user));
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
