import api from './api';

export const authService = {
  login: async (credentials) => {
    // Connects to POST /api/auth/login
    return api.post('/auth/login', credentials).then(res => res.data);
  },

  register: async (credentials) => {
    // credentials must include username, email, password
    return api.post('/auth/register', credentials).then(res => res.data);
  },

  logout: async (refreshToken) => {
    // Connects to POST /api/auth/logout (requires Authorization header and refreshToken)
    return api.post('/auth/logout', { refreshToken });
  },

  getCurrentUser: async () => {
    // Connects to GET /api/auth/profile (requires Authorization header)
    return api.get('/auth/profile').then(res => res.data.user);
  },
};