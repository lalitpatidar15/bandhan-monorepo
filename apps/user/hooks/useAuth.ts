import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import { logout } from '@/store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isInitialized } = useAppSelector((state) => state.auth);

  const isAuthenticated = !!token && !!user;

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    user,
    token,
    isAuthenticated,
    isInitialized,
    logout: handleLogout,
  };
};
