import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { store } from './store/store';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import Login from './pages/Login';

function App() {
  return (
    <HelmetProvider>
      <Provider store={store}>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/login" element={<Login />} />
            {/* Add more routes as needed */}
          </Routes>
        </Router>
      </Provider>
    </HelmetProvider>
  );
}

export default App;