// Lightweight service to fetch recommendations from FastAPI
// Uses Vite dev proxy to avoid CORS; ensure proxy routes '/recommend' to FastAPI.

export const recommendService = {
  getRecommendations: async (productName) => {
    const url = `/recommend?product_name=${encodeURIComponent(productName)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Send body too for compatibility, although FastAPI may read from query
      body: JSON.stringify({ product_name: productName }),
    });

    if (!response.ok) {
      throw new Error(`Recommend API error: ${response.status}`);
    }

    const data = await response.json();
    return data.recommended_products || [];
  },
};