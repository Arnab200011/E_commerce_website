import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import cartSlice from './slices/cartSlice';
import productSlice from './slices/productSlice';
import orderSlice from './slices/orderSlice';
import themeSlice from './slices/themeSlice';
import chatbotSlice from './slices/chatbotSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    cart: cartSlice,
    products: productSlice,
    orders: orderSlice,
    theme: themeSlice,
    chatbot: chatbotSlice,
  },
});