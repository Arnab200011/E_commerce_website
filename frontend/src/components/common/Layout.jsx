import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { setDarkMode } from '../../store/slices/themeSlice';
import Header from './Header';
import Footer from './Footer';
import CartSidebar from '../cart/CartSidebar';
import Chatbot from '../chatbot/Chatbot';

const Layout = ({ 
  children, 
  title = 'ShopEase - Your Ultimate Shopping Destination',
  description = 'Discover amazing products at great prices. Shop electronics, clothing, home goods and more.',
  keywords = 'shopping, ecommerce, electronics, clothing, home goods'
}) => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  useEffect(() => {
    // Initialize dark mode from localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    dispatch(setDarkMode(savedDarkMode));
    document.documentElement.classList.toggle('dark', savedDarkMode);
  }, [dispatch]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </div>

      <CartSidebar />
      <Chatbot />
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: isDarkMode ? 'dark:bg-gray-800 dark:text-white' : '',
        }}
      />
    </div>
  );
};

export default Layout;