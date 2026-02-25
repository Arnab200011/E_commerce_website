import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: JSON.parse(localStorage.getItem('cartItems') || '[]'),
  total: 0,
  itemCount: 0,
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.items.find(
        item => item.id === action.payload.id && 
                 item.size === action.payload.size && 
                 item.color === action.payload.color
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      
      cartSlice.caseReducers.calculateTotals(state);
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        item => !(item.id === action.payload.id && 
                  item.size === action.payload.size && 
                  item.color === action.payload.color)
      );
      cartSlice.caseReducers.calculateTotals(state);
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const item = state.items.find(
        item => item.id === action.payload.id && 
                 item.size === action.payload.size && 
                 item.color === action.payload.color
      );
      
      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          state.items = state.items.filter(i => i !== item);
        }
      }
      
      cartSlice.caseReducers.calculateTotals(state);
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.itemCount = 0;
      localStorage.removeItem('cartItems');
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    calculateTotals: (state) => {
      state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, calculateTotals } = cartSlice.actions;
export default cartSlice.reducer;