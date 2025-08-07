// API configuration
const API_BASE_URL = 'http://localhost:8000';

// Fallback responses for when the backend is not available
const fallbackResponses = {
  'return policy': 'Our return policy allows you to return items within 30 days of purchase for a full refund. Items must be in original condition with tags attached.',
  'shipping': 'We offer free shipping on orders over $100. Standard shipping takes 3-5 business days, and express shipping takes 1-2 business days.',
  'payment': 'We accept all major credit cards, PayPal, Apple Pay, and Google Pay for secure payment processing.',
  'help': 'I\'m here to help! You can ask me about products, orders, returns, shipping, or anything else.',
  'hello': 'Hello! I\'m your shopping assistant. How can I help you today?',
  'bye': 'Goodbye! Feel free to come back if you have any other questions.',
};

export const chatbotService = {
  sendMessage: async (message) => {
    try {
      // Try to connect to Python backend
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'frontend_user', // You can generate unique user IDs
          message: message,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          message: data.response,
          type: 'text',
        };
      } else {
        throw new Error('Backend not available');
      }
    } catch (error) {
      console.warn('Backend not available, using fallback responses:', error);
      
      // Fallback to local responses
      const lowerMessage = message.toLowerCase().trim();
      
      // Check for common keywords in fallback responses
      for (const [keyword, response] of Object.entries(fallbackResponses)) {
        if (lowerMessage.includes(keyword)) {
          return {
            message: response,
            type: 'text',
          };
        }
      }
      
      // Default fallback response
      return {
        message: 'I\'m here to help! You can ask me about products, orders, returns, shipping, or anything else. For the best experience, make sure the backend server is running.',
        type: 'text',
      };
    }
  },

  getQuickActions: () => [
    { label: 'Track Order', action: 'Track Order' },
    { label: 'Get Product', action: 'Get Product' },
    { label: 'Return Policy', action: 'return policy' },
    { label: 'Shipping Info', action: 'shipping' },
    { label: 'Payment Methods', action: 'payment' },
    { label: 'Contact Support', action: 'help' },
  ],

  // Check if backend is available
  checkBackendStatus: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'status_check',
          message: 'hello',
        }),
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  },
};