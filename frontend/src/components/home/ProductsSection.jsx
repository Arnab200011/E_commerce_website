import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Filter, Grid, List, ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../products/ProductCard';
import ProductFilters from '../products/ProductFilters'; // Assuming this exists
import LoadingSpinner from '../common/LoadingSpinner';
import { setProducts, updateFilters, setSortBy } from '../../store/slices/productSlice';
import { productService } from '../../services/productService';

const ProductsSection = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  
  // Redux State
  const { filteredProducts, isLoading, sortBy, searchQuery, isUsingRecommendations } = useSelector((state) => state.products);
  
  // Local State
  const [viewMode, setViewMode] = useState('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle Scroll for sticky header effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await productService.getProducts();
        dispatch(setProducts(products));
        
        const categoryFromUrl = searchParams.get('category');
        if (categoryFromUrl) {
          dispatch(updateFilters({ category: categoryFromUrl }));
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, [dispatch, searchParams]);

  const handleSortChange = (e) => {
    dispatch(setSortBy(e.target.value));
  };

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'price-low', label: 'Price (Low to High)' },
    { value: 'price-high', label: 'Price (High to Low)' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* Header Section */}
      <div className={`sticky top-0 z-30 transition-all duration-200 ${isScrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            
            {/* Title & Count */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                {isUsingRecommendations 
                  ? <span className="flex items-center gap-2">Recommended for you</span>
                  : (searchQuery ? `Results for "${searchQuery}"` : 'Discover Products')}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
                {filteredProducts.length} items found
              </p>
            </div>

            {/* Controls Toolbar */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              
              {/* Mobile Filter Toggle */}
              

              {/* Sort Dropdown - Custom styled wrapper */}
              <div className="relative group flex-1 md:flex-none">
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="w-full md:w-48 appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2.5 pl-4 pr-10 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer hover:border-gray-300"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-gray-600 transition-colors" />
              </div>

              {/* View Toggle */}
              <div className="hidden sm:flex bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 relative">
          
          {/* Desktop Sidebar */}
          

          {/* Mobile Filter Drawer */}
          <AnimatePresence>
            {showMobileFilters && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowMobileFilters(false)}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                />
                
                {/* Drawer Panel */}
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                  className="fixed right-0 top-0 h-full w-full sm:w-80 bg-white dark:bg-gray-900 z-50 p-6 overflow-y-auto lg:hidden shadow-2xl"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h2>
                    <button 
                      onClick={() => setShowMobileFilters(false)}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <ProductFilters />
                  
                  <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                    >
                      Show {filteredProducts.length} Results
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main Product Grid */}
          <main className="flex-1 min-h-[600px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <LoadingSpinner size="large" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700"
              >
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-full mb-4">
                  <Grid className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm text-center">
                  We couldn't find any matches for your current filters. Try adjusting your search or categories.
                </p>
                <button 
                  onClick={() => dispatch(updateFilters({}))} // Assuming this clears filters
                  className="mt-6 text-blue-600 font-medium hover:underline"
                >
                  Clear all filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                key={viewMode} // Re-triggers animation on view change
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {filteredProducts.map((product) => (
                  <motion.div key={product.id} variants={itemVariants} layout>
                    <ProductCard
                      product={product}
                      viewMode={viewMode}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductsSection;