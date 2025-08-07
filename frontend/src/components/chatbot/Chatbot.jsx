import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MessageCircle, X, Send, Bot, User, ExternalLink, Wifi, WifiOff } from 'lucide-react';
import { toggleChatbot, addMessage, setTyping } from '../../store/slices/chatbotSlice';
import { chatbotService } from '../../services/chatbotService';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
  const dispatch = useDispatch();
  const { isOpen, messages, isTyping } = useSelector((state) => state.chatbot);
  const [inputMessage, setInputMessage] = useState('');
  const [backendStatus, setBackendStatus] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Check backend status when component mounts
  useEffect(() => {
    const checkBackendStatus = async () => {
      const status = await chatbotService.checkBackendStatus();
      setBackendStatus(status);
    };
    
    checkBackendStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (message) => {
    const messageToSend = message || inputMessage.trim();
    if (!messageToSend) return;

    // Add user message
    dispatch(addMessage({
      text: messageToSend,
      sender: 'user',
      type: 'text',
    }));

    setInputMessage('');
    dispatch(setTyping(true));

    try {
      // Get bot response
      const response = await chatbotService.sendMessage(messageToSend);
      
      // Update backend status based on response
      if (response.message.includes('backend server is running')) {
        setBackendStatus(false);
      } else {
        setBackendStatus(true);
      }
      
      dispatch(addMessage({
        text: response.message,
        sender: 'bot',
        type: response.type,
        data: response.data,
      }));
    } catch (error) {
      setBackendStatus(false);
      dispatch(addMessage({
        text: 'Sorry, I\'m having trouble right now. Please try again or contact our support team.',
        sender: 'bot',
        type: 'text',
      }));
    } finally {
      dispatch(setTyping(false));
    }
  };

  const handleQuickAction = (action) => {
    handleSendMessage(action);
  };

  const renderMessage = (message) => {
    const isBot = message.sender === 'bot';

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}
      >
        <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md`}>
          {isBot && (
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
          )}
          
          <div
            className={`p-3 rounded-lg ${
              isBot
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                : 'bg-blue-600 text-white'
            }`}
          >
            <p className="text-sm">{message.text}</p>
            
            {/* Render special message types */}
            {message.type === 'product' && message.data && (
              <div className="mt-2 space-y-2">
                {message.data.map((product) => (
                  <div key={product.id} className="p-2 bg-white dark:bg-gray-800 rounded border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{product.name}</span>
                      <span className="text-sm font-bold">${product.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {message.type === 'contact' && message.data && (
              <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded text-sm">
                <div className="space-y-1">
                  <div><strong>Phone:</strong> {message.data.phone}</div>
                  <div><strong>Email:</strong> {message.data.email}</div>
                  <div><strong>Hours:</strong> {message.data.hours}</div>
                </div>
              </div>
            )}
            
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {new Date(message.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
          
          {!isBot && (
            <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => dispatch(toggleChatbot())}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        
        {/* Backend status indicator */}
        <div className="absolute -top-1 -right-1">
          {backendStatus ? (
            <Wifi className="w-4 h-4 text-green-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-400" />
          )}
        </div>
      </motion.button>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-24 right-6 z-40 w-80 h-96 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-white rounded-t-lg">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5" />
                <h3 className="font-semibold">Shopping Assistant</h3>
                <div className="flex items-center space-x-1">
                  {backendStatus ? (
                    <Wifi className="w-3 h-3 text-green-400" />
                  ) : (
                    <WifiOff className="w-3 h-3 text-red-400" />
                  )}
                </div>
              </div>
              <button
                onClick={() => dispatch(toggleChatbot())}
                className="text-white hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Backend Status Message */}
            {!backendStatus && (
              <div className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs">
                <div className="flex items-center space-x-1">
                  <WifiOff className="w-3 h-3" />
                  <span>Using fallback responses. Start the Python backend for full functionality.</span>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(renderMessage)}
              
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2 mb-2">
                {chatbotService.getQuickActions().map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.action)}
                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2 p-4 border-t border-gray-200 dark:border-gray-700"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isTyping}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;