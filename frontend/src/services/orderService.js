// Mock orders for development
let mockOrders = [
  {
    id: 'order-1',
    userId: '2',
    items: [
      {
        id: '1',
        name: 'Premium Wireless Headphones',
        price: 299.99,
        image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800',
        quantity: 1,
        color: 'Black',
      },
    ],
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
      phone: '+1-555-0123',
    },
    paymentMethod: 'Credit Card',
    subtotal: 299.99,
    shipping: 9.99,
    tax: 24.00,
    total: 333.98,
    status: 'shipped',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T14:20:00Z',
  },
];

export const orderService = {
  createOrder: async (orderData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 100 ? 0 : 9.99;
        const tax = subtotal * 0.08;
        const total = subtotal + shipping + tax;

        const newOrder = {
          id: 'order-' + Date.now(),
          userId: '2', // Mock user ID
          items: orderData.items,
          shippingAddress: orderData.shippingAddress,
          paymentMethod: orderData.paymentMethod,
          subtotal,
          shipping,
          tax,
          total,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        mockOrders.unshift(newOrder);
        resolve(newOrder);
      }, 1000);
    });
  },

  getUserOrders: async (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userOrders = mockOrders.filter(order => order.userId === userId);
        resolve(userOrders);
      }, 500);
    });
  },

  getOrder: async (orderId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const order = mockOrders.find(o => o.id === orderId);
        resolve(order || null);
      }, 300);
    });
  },

  updateOrderStatus: async (orderId, status) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const order = mockOrders.find(o => o.id === orderId);
        if (order) {
          order.status = status;
          order.updatedAt = new Date().toISOString();
          resolve(order);
        } else {
          reject(new Error('Order not found'));
        }
      }, 500);
    });
  },

  getAllOrders: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockOrders]);
      }, 500);
    });
  },
};