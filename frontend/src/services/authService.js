import api from './api';

export const authService = {
  login: async (credentials) => {
    // Connects to POST /api/auth/login
    // Refresh token is automatically set in HTTP-only cookie by backend
    return api.post('/auth/login', credentials).then(res => res.data);
  },

  register: async (credentials) => {
    // credentials must include username, email, password
    // Refresh token is automatically set in HTTP-only cookie by backend
    return api.post('/auth/register', credentials).then(res => res.data);
  },

  logout: async () => {
    // Connects to POST /api/auth/logout (requires Authorization header)
    // Refresh token is automatically sent from cookie
    return api.post('/auth/logout');
  },

  getCurrentUser: async () => {
    // Connects to GET /api/auth/profile (requires Authorization header)
    return api.get('/auth/profile').then(res => res.data.user);
  },

  refreshToken: async () => {
    // Connects to POST /api/auth/refresh-token
    // Refresh token is automatically sent from cookie
    return api.post('/auth/refresh-token').then(res => res.data);
  },
};