# React Frontend Integration Examples

This document shows how to integrate the backend API with a React frontend.

## Setup

### 1. Install Axios

```bash
npm install axios
```

### 2. Create API Client

Create `src/api/client.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default apiClient;
```

## Authentication Context

Create `src/context/AuthContext.jsx`:

```javascript
import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });

      const { token, user } = response;

      // Store in state
      setToken(token);
      setUser(user);

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed'
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await apiClient.post('/auth/register', {
        name,
        email,
        password
      });

      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = () => !!token;
  const isAdmin = () => user?.role === 'ADMIN';

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## API Service Functions

Create `src/api/services.js`:

```javascript
import apiClient from './client';

// Auth Services
export const authService = {
  register: (name, email, password) =>
    apiClient.post('/auth/register', { name, email, password }),

  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),

  verifyEmail: (token) =>
    apiClient.get(`/auth/verify-email/${token}`),

  getProfile: () =>
    apiClient.get('/auth/me')
};

// Product Services
export const productService = {
  getAll: (page = 1, pageSize = 20) =>
    apiClient.get(`/products?page=${page}&pageSize=${pageSize}`),

  getById: (id) =>
    apiClient.get(`/products/${id}`),

  search: (keyword) =>
    apiClient.get(`/products/search?keyword=${encodeURIComponent(keyword)}`),

  create: (productData) =>
    apiClient.post('/products', productData),

  update: (id, productData) =>
    apiClient.put(`/products/${id}`, productData),

  delete: (id) =>
    apiClient.delete(`/products/${id}`)
};

// Search History Services
export const searchHistoryService = {
  getHistory: () =>
    apiClient.get('/search-history')
};
```

## Component Examples

### Login Component

Create `src/components/Login.jsx`:

```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
```

### Register Component

Create `src/components/Register.jsx`:

```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await register(
      formData.name,
      formData.email,
      formData.password
    );

    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="register-container">
      <h2>Register</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;
```

### Product Search Component

Create `src/components/ProductSearch.jsx`:

```javascript
import React, { useState } from 'react';
import { productService, searchHistoryService } from '../api/services';

const ProductSearch = () => {
  const [keyword, setKeyword] = useState('');
  const [products, setProducts] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load search history on mount
  React.useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const response = await searchHistoryService.getHistory();
      setSearchHistory(response.data);
    } catch (err) {
      console.error('Failed to load search history:', err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!keyword.trim()) {
      setError('Please enter a search keyword');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await productService.search(keyword);
      setProducts(response.data);

      // Refresh search history after searching
      loadSearchHistory();
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (historyKeyword) => {
    setKeyword(historyKeyword);
    // Trigger search with history keyword
    productService.search(historyKeyword)
      .then(response => {
        setProducts(response.data);
        loadSearchHistory();
      })
      .catch(err => setError(err.message));
  };

  return (
    <div className="product-search">
      <h2>Search Products</h2>

      {/* Search Form */}
      <form onSubmit={handleSearch}>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search for products..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="search-history">
          <h3>Recent Searches</h3>
          <div className="history-tags">
            {searchHistory.map((item) => (
              <button
                key={item._id}
                className="history-tag"
                onClick={() => handleHistoryClick(item.keyword)}
              >
                {item.keyword}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      <div className="search-results">
        <h3>Results ({products.length})</h3>

        {products.length === 0 && !loading && (
          <p>No products found. Try a different keyword.</p>
        )}

        <div className="product-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              <img
                src={product.images[0] || '/placeholder.png'}
                alt={product.name}
              />
              <h4>{product.name}</h4>
              <p className="price">${product.price}</p>
              <p className="brand">{product.brand}</p>
              <button>View Details</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductSearch;
```

### Protected Route Component

Create `src/components/ProtectedRoute.jsx`:

```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

## App Setup

Update `src/App.js`:

```javascript
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import ProductSearch from './components/ProductSearch';
import AdminPanel from './components/AdminPanel';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ProductSearch />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

## Environment Variables

Create `.env` in your React app root:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install axios react-router-dom
   ```

2. **Copy the code** from above into your React app

3. **Update your main index.js** to wrap with AuthProvider if needed

4. **Start your React app**:
   ```bash
   npm start
   ```

The React app will now communicate with your backend API for authentication, product search, and search history tracking!
