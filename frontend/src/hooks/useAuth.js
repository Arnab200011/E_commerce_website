import { useSelector, useDispatch } from 'react-redux';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  initializeAuth,
  initializeAuthSuccess,
  initializeAuthFailure
} from '../store/slices/authSlice';
import { authService } from '../services/authService';
import { useState } from 'react';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isLoading, error, isInitialized } = useSelector((state) => state.auth);
  const [isLoadingState, setIsLoading] = useState(false);
  const [errorState, setError] = useState(null);

  const login = async (credentials) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      dispatch(loginSuccess(response));
      return response;
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Invalid email or password'
      );
      dispatch(loginFailure(err.message || 'Login failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials) => {
    dispatch(loginStart());
    try {
      const response = await authService.register(credentials);
      dispatch(loginSuccess(response));
      return response;
    } catch (err) {
      dispatch(loginFailure(err.message || 'Registration failed'));
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await authService.logout();
      dispatch(logout());
    } catch (err) {
      console.error('Logout error:', err);
      dispatch(logout()); // Still logout locally even if API call fails
    }
  };

  const initializeSession = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      dispatch(initializeAuthFailure());
      return;
    }

    dispatch(initializeAuth());

    try {
      const user = await authService.getCurrentUser();
      dispatch(initializeAuthSuccess(user));
    } catch (err) {
      console.error('Session initialization error:', err);
      dispatch(initializeAuthFailure());
    }
  };

  return {
    user,
    token,
    isLoading: isLoadingState,
    error: errorState,
    isAuthenticated: !!token && !!user,
    isInitialized,
    login,
    register,
    logout: signOut,
    initializeSession,
  };
};