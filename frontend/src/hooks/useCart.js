import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, calculateTotals } from '../store/slices/cartSlice';
import { useEffect } from 'react';

export const useCart = () => {
  const dispatch = useDispatch();
  const { items, total, itemCount, isOpen } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(calculateTotals());
  }, [items, dispatch]);

  const addItem = (item) => {
    dispatch(addToCart(item));
  };

  const removeItem = (id, size, color) => {
    dispatch(removeFromCart({ id, size, color }));
  };

  const updateItemQuantity = (id, quantity, size, color) => {
    dispatch(updateQuantity({ id, quantity, size, color }));
  };

  const clear = () => {
    dispatch(clearCart());
  };

  const toggle = () => {
    dispatch(toggleCart());
  };

  return {
    items,
    total,
    itemCount,
    isOpen,
    addItem,
    removeItem,
    updateItemQuantity,
    clear,
    toggle,
  };
};