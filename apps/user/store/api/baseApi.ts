import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  localStorage.removeItem('user');
  if (typeof window !== 'undefined') {
    document.cookie = 'bandhan_user_token=; Path=/; Max-Age=0; SameSite=Lax';
    const returnTo = `${window.location.pathname}${window.location.search}`;
    const isOnAuthPage = window.location.pathname === '/login' || window.location.pathname === '/signup';
    window.location.href = isOnAuthPage ? '/login' : `/login?next=${encodeURIComponent(returnTo)}`;
  }
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://bandhan-backend-gykw.onrender.com/api',
  credentials: 'include',
  prepareHeaders: (headers) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return headers;
  },
});

const baseQueryWithLogout: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  const url = typeof args === 'string' ? args : args.url;
  const isAuthenticationRequest = /(?:^|\/)auth\/(?:login|register|forgot-password|reset-password)/.test(url);

  // Invalid login credentials are a normal form error, not an expired session.
  // Redirecting here creates /login?next=/login redirect loops.
  if (result.error && 'status' in result.error && result.error.status === 401 && !isAuthenticationRequest) {
    logout();
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithLogout,
  tagTypes: ['Vendors', 'Dashboard', 'Events', 'User', 'Auth', 'Reviews', 'ReviewSummary', 'Chat', 'Notifications', 'Quotes', 'Blogs'],

  endpoints: () => ({}),
});

export default baseApi;
