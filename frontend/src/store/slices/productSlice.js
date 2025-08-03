import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  filteredProducts: [],
  currentProduct: null,
  filters: {
    category: '',
    brand: '',
    minPrice: 0,
    maxPrice: 10000,
    rating: 0,
    inStock: false,
  },
  searchQuery: '',
  sortBy: 'name',
  isLoading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
      state.filteredProducts = action.payload;
    },
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      productSlice.caseReducers.applyFilters(state);
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      productSlice.caseReducers.applyFilters(state);
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
      productSlice.caseReducers.applySorting(state);
    },
    applyFilters: (state) => {
      let filtered = state.products;

      if (state.searchQuery) {
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(state.searchQuery.toLowerCase())
        );
      }

      if (state.filters.category) {
        filtered = filtered.filter(product => product.category === state.filters.category);
      }

      if (state.filters.brand) {
        filtered = filtered.filter(product => product.brand === state.filters.brand);
      }

      filtered = filtered.filter(product =>
        product.price >= state.filters.minPrice && product.price <= state.filters.maxPrice
      );

      if (state.filters.rating > 0) {
        filtered = filtered.filter(product => product.rating >= state.filters.rating);
      }

      if (state.filters.inStock) {
        filtered = filtered.filter(product => product.inStock);
      }

      state.filteredProducts = filtered;
      productSlice.caseReducers.applySorting(state);
    },
    applySorting: (state) => {
      switch (state.sortBy) {
        case 'price-low':
          state.filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          state.filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          state.filteredProducts.sort((a, b) => b.rating - a.rating);
          break;
        case 'name':
        default:
          state.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
    },
  },
});

export const { setProducts, setCurrentProduct, updateFilters, setSearchQuery, setSortBy } = productSlice.actions;
export default productSlice.reducer;