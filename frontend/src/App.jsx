import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { store } from './store/store';
import { initializeAuth, initializeAuthSuccess, initializeAuthFailure } from './store/slices/authSlice';
import { authService } from './services/authService';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import Login from './pages/Login';
import ProductView from './pages/ProductView';

// Auth initializer component
function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const { isInitialized } = useSelector((state) => state.auth);

  useEffect(() => {
    const initSession = async () => {
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

    initSession();
  }, [dispatch]);

  // Show loading spinner while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  return children;
}

function App() {
  return (
    <HelmetProvider>
      <Provider store={store}>
        <Router>
          <AuthInitializer>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/login" element={<Login />} />
              <Route path="/products/:id" element={<ProductView />} />
              {/* Add more routes as needed */}
            </Routes>
          </AuthInitializer>
        </Router>
      </Provider>
    </HelmetProvider>
  );
}

export default App;