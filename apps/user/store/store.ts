import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import { locationApi } from './api/locationApi';
import authReducer from './slices/authSlice';
import locationReducer from './slices/locationSlice';

// Import all API slices to register them
import './api/authApi';
import './api/vendorApi';
import './api/venueApi';
import './api/bookingApi';
import './api/cartApi';
import './api/reviewApi';
import './api/notificationApi';
import './api/eventApi';
import './api/userApi';
import './api/dashboardApi';
import './api/rentalOrderApi';
import './api/productApi';
import './api/serviceApi';
import './api/venueApi';
import './api/userApi';
import './api/customerApi';
import './api/chatApi';
import './api/invoiceApi';
import './api/notificationApi';
import './api/quoteApi';
import './api/returnApi';
import './api/wishlistApi';
import './api/authApi';
import './api/cartApi';
import './api/eventApi';
import './api/locationApi';
import './api/blogApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    location: locationReducer,
    [baseApi.reducerPath]: baseApi.reducer,
    [locationApi.reducerPath]: locationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, locationApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Initialize real-time socket listeners to keep RTK Query caches in sync (browser-only)
if (typeof window !== 'undefined') {
  import('./../lib/socket').then(async (mod) => {
  try {
    const getSocket = mod.getSocket;
    const socket = await getSocket();
    if (!socket) return;

    socket.on('receive_message', () => {
      try {
        store.dispatch(baseApi.util.invalidateTags(['Chat']));
      } catch (e) {
        console.warn('Failed to invalidate chat tags', e);
      }
    });

    socket.on('conversation_updated', () => {
      try {
        store.dispatch(baseApi.util.invalidateTags(['Chat']));
      } catch (e) {
        console.warn('Failed to invalidate chat tags', e);
      }
    });

    socket.on('notificationReceived', () => {
      try {
        store.dispatch(baseApi.util.invalidateTags(['Notifications']));
      } catch (e) {
        console.warn('Failed to invalidate notification tags', e);
      }
    });
  } catch (err) {
    console.warn('Socket init failed', err);
  }
  }).catch((e) => console.warn('Failed to load socket helper', e));
}
