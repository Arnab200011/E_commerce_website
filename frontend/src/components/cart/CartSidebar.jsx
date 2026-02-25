import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { toggleCart, updateQuantity, removeFromCart } from '../../store/slices/cartSlice';
import { motion, AnimatePresence } from 'framer-motion';

const CartSidebar = () => {
  const dispatch = useDispatch();
  const { items, total, itemCount, isOpen } = useSelector((state) => state.cart);

  const handleUpdateQuantity = (id, quantity, size, color) => {
    if (quantity <= 0) {
      dispatch(removeFromCart({ id, size, color }));
    } else {
      dispatch(updateQuantity({ id, quantity, size, color }));
    }
  };

  const handleRemoveItem = (id, size, color) => {
    dispatch(removeFromCart({ id, size, color }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(toggleCart())}
            className="fixed inset-0 z-50 bg-black bg-opacity-50"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Shopping Cart ({itemCount})
              </h2>
              <button
                onClick={() => dispatch(toggleCart())}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <ShoppingBag className="w-16 h-16 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
                  <p className="text-center mb-6">Add some amazing products to get started!</p>
                  <Link
                    to="/products"
                    onClick={() => dispatch(toggleCart())}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={`${item.id}-${item.size}-${item.color}`}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      {/* Product Image */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.name}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          {item.size && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Color: {item.color}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            ${item.price.toFixed(2)}
                          </span>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id, item.size, item.color)}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Total:
                  </span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    ${total.toFixed(2)}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <Link
                    to="/checkout"
                    onClick={() => dispatch(toggleCart())}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center block"
                  >
                    Checkout
                  </Link>
                  <Link
                    to="/cart"
                    onClick={() => dispatch(toggleCart())}
                    className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-center block"
                  >
                    View Cart
                  </Link>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                  Free shipping on orders over $100
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;