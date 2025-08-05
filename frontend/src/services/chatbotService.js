// Mock FAQ responses
const faqResponses = {
  'return policy': 'Our return policy allows you to return items within 30 days of purchase for a full refund. Items must be in original condition with tags attached.',
  'shipping': 'We offer free shipping on orders over $100. Standard shipping takes 3-5 business days, and express shipping takes 1-2 business days.',
  'payment': 'We accept all major credit cards, PayPal, Apple Pay, and Google Pay for secure payment processing.',
  'warranty': 'Most of our products come with manufacturer warranties. Electronic items typically have 1-2 year warranties, while clothing has quality guarantees.',
  'sizing': 'Please check our size guide on each product page. We offer exchanges for size issues within 30 days.',
};

// Mock product suggestions
const productSuggestions = {
  'headphones': [
    { id: '1', name: 'Premium Wireless Headphones', price: 299.99 },
  ],
  'watch': [
    { id: '2', name: 'Smart Fitness Watch', price: 249.99 },
  ],
  'shirt': [
    { id: '3', name: 'Organic Cotton T-Shirt', price: 29.99 },
  ],
};

export const chatbotService = {
  sendMessage: async (message) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerMessage = message.toLowerCase();

        // Check for FAQ keywords
        for (const [keyword, response] of Object.entries(faqResponses)) {
          if (lowerMessage.includes(keyword)) {
            resolve({
              message: response,
              type: 'text',
            });
            return;
          }
        }

        // Check for product search
        for (const [keyword, products] of Object.entries(productSuggestions)) {
          if (lowerMessage.includes(keyword)) {
            resolve({
              message: `I found some ${keyword} products you might like:`,
              type: 'product',
              data: products,
            });
            return;
          }
        }

        // Check for order tracking
        if (lowerMessage.includes('order') && lowerMessage.includes('track')) {
          resolve({
            message: 'Please provide your order ID and I\'ll help you track your order.',
            type: 'order',
          });
          return;
        }

        // Check for contact/help
        if (lowerMessage.includes('contact') || lowerMessage.includes('help') || lowerMessage.includes('support')) {
          resolve({
            message: 'I\'d be happy to connect you with our support team. Please fill out this contact form:',
            type: 'contact',
            data: {
              phone: '+1-800-SHOP-NOW',
              email: 'support@example.com',
              hours: 'Mon-Fri 9AM-6PM EST',
            },
          });
          return;
        }

        // Default response
        resolve({
          message: 'I\'m here to help! You can ask me about our return policy, shipping information, product recommendations, or order tracking. How can I assist you today?',
          type: 'text',
        });
      }, 1000);
    });
  },

  getQuickActions: () => [
    { label: 'Return Policy', action: 'return policy' },
    { label: 'Shipping Info', action: 'shipping' },
    { label: 'Track Order', action: 'track order' },
    { label: 'Contact Support', action: 'contact support' },
  ],
};