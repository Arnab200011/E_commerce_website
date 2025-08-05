import api from './api';

// Mock users for development
const mockUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
  },
  {
    id: '2',
    email: 'user@example.com',
    name: 'John Doe',
    role: 'customer',
  },
];

export const authService = {
  login: async (credentials) => {
    // In a real app: return api.post('/auth/login', credentials).then(res => res.data);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(u => u.email === credentials.email);
        if (user && credentials.password === 'password') {
          resolve({
            user,
            token: 'mock-jwt-token-' + user.id,
          });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  },

  register: async (credentials) => {
    // return api.post('/auth/register', credentials).then(res => res.data);
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          id: Date.now().toString(),
          name: credentials.name,
          email: credentials.email,
          role: 'customer',
        };
        resolve({
          user: newUser,
          token: 'mock-jwt-token-' + newUser.id,
        });
      }, 1000);
    });
  },

  logout: async () => {
    // return api.post('/auth/logout');
    return Promise.resolve();
  },

  getCurrentUser: async () => {
    // return api.get('/auth/me').then(res => res.data);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const token = localStorage.getItem('token');
        if (token) {
          const userId = token.split('-').pop();
          const user = mockUsers.find(u => u.id === userId);
          if (user) {
            resolve(user);
          } else {
            reject(new Error('User not found'));
          }
        } else {
          reject(new Error('No token found'));
        }
      }, 500);
    });
  },
};