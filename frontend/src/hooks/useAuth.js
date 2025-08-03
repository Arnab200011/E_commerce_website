import { useSelector, useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure, logout } from '../store/slices/authSlice';
import { authService } from '../services/authService';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isLoading, error } = useSelector((state) => state.auth);

  const login = async (credentials) => {
    dispatch(loginStart());
    try {
      const response = await authService.login(credentials);
      dispatch(loginSuccess(response));
      return response;
    } catch (err) {
      dispatch(loginFailure(err.message || 'Login failed'));
      throw err;
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
    isLoading,
    error,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout: signOut,
  };
};