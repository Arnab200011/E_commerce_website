import api from './api';

export const searchHistoryService = {
  // Save a search query to history
  saveSearch: async (keyword) => {
    if (!keyword || !keyword.trim()) return false;
    const k = keyword.trim();

    // Try to save on backend first (works when user is authenticated)
    try {
      // Some backends may auto-save via /products/search; if an explicit endpoint exists use it.
      // We'll attempt to POST to /search-history if available, otherwise skip.
      if (typeof api.post === 'function') {
        try {
          await api.post('/search-history', { keyword: k }, { withCredentials: true });
        } catch (e) {
          // ignore backend errors (likely unauthenticated)
        }
      }
    } catch (err) {
      // ignore
    }

    // Always save locally as a fallback for anonymous users
    try {
      const key = 'shop_ease_search_history_v1';
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      // keep uniqueness and recent-first
      const filtered = arr.filter(i => i.toLowerCase() !== k.toLowerCase());
      filtered.unshift(k);
      const trimmed = filtered.slice(0, 10);
      localStorage.setItem(key, JSON.stringify(trimmed));
      return true;
    } catch (error) {
      console.error('Error saving local search history:', error);
      return false;
    }
  },

  // Get user's search history
  getSearchHistory: async () => {
    // Try backend first (for authenticated users)
    try {
      const response = await api.get('/search-history', { withCredentials: true });
      return response.data?.data || [];
    } catch (error) {
      // Fallback to localStorage for anonymous users
      try {
        const key = 'shop_ease_search_history_v1';
        const raw = localStorage.getItem(key);
        const arr = raw ? JSON.parse(raw) : [];
        return arr;
      } catch (err) {
        console.error('Error reading local search history:', err);
        return [];
      }
    }
  },

  // Clear search history (if backend supports it)
  clearSearchHistory: async () => {
    // Try backend clear first
    let backendOk = false;
    try {
      const response = await api.delete('/search-history', { withCredentials: true });
      backendOk = response.data?.success || false;
    } catch (error) {
      // ignore
    }

    // Clear localStorage fallback
    try {
      const key = 'shop_ease_search_history_v1';
      localStorage.removeItem(key);
    } catch (err) {
      console.error('Error clearing local search history:', err);
    }

    return backendOk || true;
  }
};
