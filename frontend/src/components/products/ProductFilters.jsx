import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateFilters } from '../../store/slices/productSlice';

const ProductFilters = () => {
  const dispatch = useDispatch();
  const { products, filters } = useSelector((state) => state.products);

  // Get unique values for filter options
  const categories = [...new Set(products.map(p => p.category))];
  const brands = [...new Set(products.map(p => p.brand))];

  const handleFilterChange = (filterType, value) => {
    dispatch(updateFilters({ [filterType]: value }));
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Filters
      </h3>

      {/* Category Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Category
        </h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="category"
              value=""
              checked={filters.category === ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">
              All Categories
            </span>
          </label>
          {categories.map((category) => (
            <label key={category} className="flex items-center">
              <input
                type="radio"
                name="category"
                value={category}
                checked={filters.category === category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Brand
        </h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="brand"
              value=""
              checked={filters.brand === ''}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">
              All Brands
            </span>
          </label>
          {brands.map((brand) => (
            <label key={brand} className="flex items-center">
              <input
                type="radio"
                name="brand"
                value={brand}
                checked={filters.brand === brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">
                {brand}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Price Range
        </h4>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ''}
              onChange={(e) => handleFilterChange('minPrice', parseFloat(e.target.value) || 0)}
              className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={(e) => handleFilterChange('maxPrice', parseFloat(e.target.value) || 10000)}
              className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Minimum Rating
        </h4>
        <div className="space-y-2">
          {[0, 3, 4, 4.5].map((rating) => (
            <label key={rating} className="flex items-center">
              <input
                type="radio"
                name="rating"
                value={rating}
                checked={filters.rating === rating}
                onChange={(e) => handleFilterChange('rating', parseFloat(e.target.value))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">
                {rating === 0 ? 'All Ratings' : `${rating}+ Stars`}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* In Stock Filter */}
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => handleFilterChange('inStock', e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">
            In Stock Only
          </span>
        </label>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => dispatch(updateFilters({
          category: '',
          brand: '',
          minPrice: 0,
          maxPrice: 10000,
          rating: 0,
          inStock: false,
        }))}
        className="w-full px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default ProductFilters;