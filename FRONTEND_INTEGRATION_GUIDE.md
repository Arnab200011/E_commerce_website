# Frontend Integration Guide

## 📋 Overview

This guide explains how to integrate the new unified backend with your existing React frontend with minimal disruption.

## 🔄 Migration Strategy

### Phase 1: Parallel Running
- Keep old backend running
- Start new unified backend on different port
- Point frontend to new backend for testing

### Phase 2: Testing
- Test all authentication flows
- Test product browsing
- Test admin features (if you have admin users)

### Phase 3: Switch Over
- Update frontend API URL
- Decommission old backends
- Monitor for issues

## 1️⃣ Update Frontend API Configuration

### Location: `frontend/services/api.js`

**Before:**
```javascript
const API_BASE_URL = 'http://localhost:5000/api'; // Old backend
```

**After:**
```javascript
const API_BASE_URL = 'http://localhost:5000/api'; // Unified backend (same or different port)
```

## 2️⃣ Update Authentication Service

### Location: `frontend/services/authService.js`

**Register endpoint - UNCHANGED:**
```javascript
export const registerUser = async (credentials) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, {
    name: credentials.name,
    email: credentials.email,
    password: credentials.password,
    confirmPassword: credentials.confirmPassword
  });
  return response.data;
};
```

**Login endpoint - ENHANCED (backward compatible):**
```javascript
export const loginUser = async (credentials) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    email: credentials.email,
    password: credentials.password
  });

  // Store token
  localStorage.setItem('token', response.data.accessToken);
  localStorage.setItem('user', JSON.stringify(response.data.user));

  // NEW: Optional role-based redirect
  if (response.data.user.role === 'ADMIN') {
    // Redirect to admin dashboard
    return { ...response.data, redirectTo: '/admin/dashboard' };
  } else {
    // Redirect to user dashboard
    return { ...response.data, redirectTo: '/dashboard' };
  }
};
```

**Get current user - UNCHANGED:**
```javascript
export const getCurrentUser = async (token) => {
  const response = await axios.get(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
```

## 3️⃣ Update Product Service

### Location: `frontend/services/productService.js`

**Get all products - UNCHANGED:**
```javascript
export const getProducts = async (page = 1, pageSize = 20) => {
  const response = await axios.get(`${API_BASE_URL}/products`, {
    params: { page, pageSize }
  });
  return response.data;
};
```

**NEW: Admin product endpoints:**
```javascript
// Add these new functions for admin panel

export const getProductsAdmin = async (page = 1, pageSize = 50, filters = {}) => {
  const response = await axios.get(`${API_BASE_URL}/admin/products`, {
    params: { page, pageSize, ...filters },
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response.data;
};

export const getProductStock = async (productId) => {
  const response = await axios.get(
    `${API_BASE_URL}/admin/products/${productId}/stock`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }
  );
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await axios.post(
    `${API_BASE_URL}/admin/products`,
    productData,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }
  );
  return response.data;
};

export const updateProduct = async (productId, productData) => {
  const response = await axios.put(
    `${API_BASE_URL}/admin/products/${productId}`,
    productData,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }
  );
  return response.data;
};

export const deleteProduct = async (productId) => {
  const response = await axios.delete(
    `${API_BASE_URL}/admin/products/${productId}`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }
  );
  return response.data;
};

export const restockProduct = async (productId, quantity, reason = '') => {
  const response = await axios.patch(
    `${API_BASE_URL}/admin/products/${productId}/restock`,
    { quantity, reason },
    {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }
  );
  return response.data;
};

export const getInventoryStats = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/admin/stats/inventory`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }
  );
  return response.data;
};
```

## 4️⃣ Update Auth Slice (Redux)

### Location: `frontend/store/slices/authSlice.js`

**Add role handling:**
```javascript
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    role: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  },
  reducers: {
    setAuth: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.role = action.payload.user?.role; // NEW: Store role
      state.isAuthenticated = true;
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
    }
  }
});

// Selector to check if user is admin
export const selectIsAdmin = (state) => state.auth.role === 'ADMIN';
export const selectUserRole = (state) => state.auth.role;
```

## 5️⃣ Update Login Component

### Location: `frontend/pages/Login.jsx`

**Enhanced login with role-based redirect:**
```javascript
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser } from '../services/authService';
import { setAuth } from '../store/slices/authSlice';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (credentials) => {
    try {
      const response = await loginUser(credentials);
      
      // Store in Redux
      dispatch(setAuth({
        user: response.user,
        token: response.accessToken
      }));

      // NEW: Role-based redirect
      if (response.user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    // ... your login form JSX
  );
}
```

## 6️⃣ Add Protected Admin Routes

### Location: `frontend/App.jsx` or `frontend/routes/ProtectedRoute.jsx`

**Create admin route protection:**
```javascript
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export function AdminRoute({ children }) {
  const isAdmin = useSelector(state => state.auth.role === 'ADMIN');
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Usage in App.jsx
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/dashboard" element={<Dashboard />} />
  
  {/* Admin routes */}
  <Route
    path="/admin/*"
    element={
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    }
  />
</Routes>
```

## 7️⃣ Create Admin Dashboard Component

### Location: `frontend/pages/Admin/AdminDashboard.jsx`

**Example admin dashboard:**
```javascript
import { useState, useEffect } from 'react';
import { getProductsAdmin, restockProduct, getInventoryStats } from '../../services/productService';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, statsData] = await Promise.all([
          getProductsAdmin(1, 50),
          getInventoryStats()
        ]);
        setProducts(productsData.data);
        setStats(statsData.data.overview);
      } catch (error) {
        console.error('Failed to load admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleRestock = async (productId, quantity) => {
    try {
      await restockProduct(productId, quantity, 'Manual restock');
      // Refresh data
      const productsData = await getProductsAdmin(1, 50);
      setProducts(productsData.data);
    } catch (error) {
      alert('Failed to restock');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      {/* Stats */}
      <div className="stats">
        <div>Total Products: {stats?.totalProducts}</div>
        <div>Total Stock: {stats?.totalStock}</div>
        <div>Out of Stock: {stats?.outOfStock}</div>
        <div>Low Stock: {stats?.lowStock}</div>
      </div>

      {/* Products Table */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>${product.price}</td>
              <td>{product.stock}</td>
              <td>{product.stockStatus}</td>
              <td>
                <button onClick={() => handleRestock(product._id, 10)}>
                  Restock
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## 8️⃣ Update Environment Variables

### Location: `frontend/.env` or `frontend/vite.config.js`

```javascript
VITE_API_URL=http://localhost:5000/api
VITE_NODE_ENV=development
```

## ✅ Testing Checklist

- [ ] Register as new user
- [ ] Login as regular user
- [ ] Access products page
- [ ] See user dashboard
- [ ] Logout
- [ ] Register as admin (or promote user)
- [ ] Login as admin
- [ ] Redirect to admin dashboard
- [ ] View all products (admin view)
- [ ] View stock details
- [ ] Create new product
- [ ] Update product
- [ ] Restock product
- [ ] View inventory stats
- [ ] Test CORS headers
- [ ] Test error messages

## 🚀 Deployment Steps

1. **Development:**
   - Start unified backend: `cd unified-backend && npm run dev`
   - Start frontend: `cd frontend && npm run dev`
   - Frontend connects to `http://localhost:5000/api`

2. **Production:**
   - Update `REACT_APP_API_URL` to production backend URL
   - Build frontend: `npm run build`
   - Deploy frontend to hosting
   - Ensure backend is accessible from production domain

## 🔗 Backward Compatibility Notes

✅ All existing product endpoints work unchanged  
✅ Authentication endpoints work with new role field  
✅ No breaking changes to frontend code  
✅ Optional: Use new admin endpoints for admin panel  
✅ Optional: Implement role-based routing  

## 📞 Troubleshooting

### CORS Error
```
Access to XMLHttpRequest blocked by CORS
```
**Solution:** Ensure frontend URL is in backend's allowedOrigins

### 401 Unauthorized
```
Token is invalid or expired
```
**Solution:** Clear localStorage and login again

### 403 Forbidden
```
Access denied. Admin privileges required.
```
**Solution:** Ensure user has ADMIN role in database

### Products not loading
```
GET /api/products failed
```
**Solution:** Check backend is running and API_BASE_URL is correct

---

**Last Updated:** 2026-02-22  
**Compatibility:** React 18+, Vite/CRA
