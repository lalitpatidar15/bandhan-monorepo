'use client';

import { useEffect, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { CartProvider } from '@/context/CartContext';
import { CompareProvider } from '@/context/CompareContext';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { initializeAuth } from '@/store/slices/authSlice';

function AuthBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return children;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <CartProvider>
        <CompareProvider>
          <AuthBootstrap>{children}</AuthBootstrap>
        </CompareProvider>
      </CartProvider>
    </Provider>
  );
}
