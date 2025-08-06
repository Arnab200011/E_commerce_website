import { useSelector, useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure, logout } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import { useState } from 'react';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isLoading, error } = useSelector((state) => state.auth);
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

  return {
    user,
    token,
    isLoading: isLoadingState,
    error: errorState,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout: signOut,
  };
};