import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
  isInitialized: false, // Track if we've tried to restore the session
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.accessToken; // Use accessToken from response
      localStorage.setItem('token', action.payload.accessToken);
      // Note: refreshToken is stored in HTTP-only cookie by backend
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isInitialized = true; // Keep initialized state
      localStorage.removeItem('token');
      // Note: refreshToken cookie will be cleared by backend on logout
    },
    setAccessToken: (state, action) => {
      // Used by the API interceptor to update token after refresh
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isInitialized = true;
    },
    clearError: (state) => {
      state.error = null;
    },
    initializeAuth: (state) => {
      state.isLoading = true;
    },
    initializeAuthSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isInitialized = true;
    },
    initializeAuthFailure: (state) => {
      state.isLoading = false;
      state.token = null;
      state.user = null;
      state.isInitialized = true;
      localStorage.removeItem('token');
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setAccessToken,
  setUser,
  clearError,
  initializeAuth,
  initializeAuthSuccess,
  initializeAuthFailure
} = authSlice.actions;

export default authSlice.reducer;