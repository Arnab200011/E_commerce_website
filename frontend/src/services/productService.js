import api from './api';

// Mock data for development
const mockProducts = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation and premium sound quality.',
    price: 299.99,
    originalPrice: 399.99,
    images: [
      'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    category: 'Electronics',
    brand: 'AudioTech',
    rating: 4.8,
    reviewCount: 1247,
    inStock: true,
    colors: ['Black', 'White', 'Silver'],
    features: ['Noise Cancellation', '30h Battery Life', 'Quick Charge', 'Bluetooth 5.0'],
    specifications: {
      'Battery Life': '30 hours',
      'Connectivity': 'Bluetooth 5.0',
      'Weight': '280g',
      'Warranty': '2 years',
    },
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracking with heart rate monitoring, GPS, and health insights.',
    price: 249.99,
    originalPrice: 329.99,
    images: [
      'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1568418/pexels-photo-1568418.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    category: 'Electronics',
    brand: 'FitTech',
    rating: 4.6,
    reviewCount: 892,
    inStock: true,
    colors: ['Black', 'Rose Gold', 'Silver'],
    sizes: ['38mm', '42mm'],
    features: ['GPS Tracking', 'Heart Rate Monitor', 'Water Resistant', '7-day Battery'],
    specifications: {
      'Display': '1.4" AMOLED',
      'Battery': '7 days',
      'Water Resistance': '50M',
      'Sensors': 'GPS, Heart Rate, Accelerometer',
    },
  },
  {
    id: '3',
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable and sustainable organic cotton t-shirt in various colors.',
    price: 29.99,
    images: [
      'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/8532617/pexels-photo-8532617.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    category: 'Clothing',
    brand: 'EcoWear',
    rating: 4.4,
    reviewCount: 324,
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Black', 'Navy', 'Gray', 'Green'],
    features: ['100% Organic Cotton', 'Pre-shrunk', 'Eco-friendly Dyes', 'Fair Trade'],
    specifications: {
      'Material': '100% Organic Cotton',
      'Care': 'Machine Wash Cold',
      'Origin': 'Fair Trade Certified',
      'Fit': 'Regular',
    },
  },
  {
    id: '4',
    name: 'Professional Camera Lens',
    description: '85mm f/1.4 portrait lens for professional photography with exceptional bokeh.',
    price: 1299.99,
    images: [
      'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    category: 'Electronics',
    brand: 'PhotoPro',
    rating: 4.9,
    reviewCount: 156,
    inStock: true,
    features: ['f/1.4 Aperture', 'Image Stabilization', 'Weather Sealed', 'Professional Grade'],
    specifications: {
      'Focal Length': '85mm',
      'Aperture': 'f/1.4 - f/16',
      'Mount': 'Canon EF',
      'Weight': '950g',
    },
  },
  {
    id: '5',
    name: 'Ergonomic Office Chair',
    description: 'Premium ergonomic office chair with lumbar support and adjustable features.',
    price: 399.99,
    originalPrice: 599.99,
    images: [
      'https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    category: 'Furniture',
    brand: 'ComfortPlus',
    rating: 4.7,
    reviewCount: 678,
    inStock: true,
    colors: ['Black', 'Gray', 'White'],
    features: ['Lumbar Support', 'Adjustable Height', 'Breathable Mesh', '360° Swivel'],
    specifications: {
      'Weight Capacity': '300 lbs',
      'Height Range': '17" - 21"',
      'Material': 'Mesh and Plastic',
      'Warranty': '5 years',
    },
  },
  {
    id: '6',
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated stainless steel water bottle that keeps drinks cold for 24h or hot for 12h.',
    price: 34.99,
    images: [
      'https://images.pexels.com/photos/1229862/pexels-photo-1229862.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/4210783/pexels-photo-4210783.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    category: 'Home & Kitchen',
    brand: 'HydroLife',
    rating: 4.5,
    reviewCount: 432,
    inStock: true,
    sizes: ['18oz', '24oz', '32oz'],
    colors: ['Silver', 'Black', 'Blue', 'Pink', 'Green'],
    features: ['Double Wall Insulation', 'BPA Free', 'Leak Proof', 'Easy Clean'],
    specifications: {
      'Capacity': '24oz',
      'Material': 'Stainless Steel',
      'Insulation': 'Vacuum Sealed',
      'Dimensions': '3" x 10.5"',
    },
  },
];

export const productService = {
  // Get all products with filters
  getProducts: async () => {
    // In a real app, this would make an API call
    // return api.get('/products').then(res => res.data);
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockProducts), 500);
    });
  },

  // Get single product by ID
  getProduct: async (id) => {
    // return api.get(`/products/${id}`).then(res => res.data);
    return new Promise((resolve) => {
      setTimeout(() => {
        const product = mockProducts.find(p => p.id === id);
        resolve(product || null);
      }, 300);
    });
  },

  // Search products
  searchProducts: async (query) => {
    // return api.get(`/products/search?q=${query}`).then(res => res.data);
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = mockProducts.filter(p =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
        );
        resolve(results);
      }, 300);
    });
  },

  // Get products by category
  getProductsByCategory: async (category) => {
    // return api.get(`/products/category/${category}`).then(res => res.data);
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = mockProducts.filter(p => p.category === category);
        resolve(results);
      }, 300);
    });
  },

  // Get featured products
  getFeaturedProducts: async () => {
    // return api.get('/products/featured').then(res => res.data);
    return new Promise((resolve) => {
      setTimeout(() => {
        const featured = mockProducts.slice(0, 4);
        resolve(featured);
      }, 300);
    });
  },
};