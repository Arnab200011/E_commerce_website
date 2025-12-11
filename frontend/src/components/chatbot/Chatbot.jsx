import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MessageCircle, X, Send, Bot, User, Wifi, WifiOff, ShoppingBag, Phone, Clock, ChevronRight } from 'lucide-react';
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
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    const checkBackendStatus = async () => {
      const status = await chatbotService.checkBackendStatus();
      setBackendStatus(status);
    };
    
    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (message) => {
    const messageToSend = message || inputMessage.trim();
    if (!messageToSend) return;

    dispatch(addMessage({ text: messageToSend, sender: 'user', type: 'text' }));
    setInputMessage('');
    dispatch(setTyping(true));

    try {
      const response = await chatbotService.sendMessage(messageToSend);
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

  const renderMessage = (message) => {
    const isBot = message.sender === 'bot';

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-6`}
      >
        <div className={`flex items-end max-w-[85%]`}>
          {isBot && (
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-2 shadow-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
          )}
          
          <div className="flex flex-col">
            <div
              className={`p-3.5 shadow-sm text-sm leading-relaxed ${
                isBot
                  ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-700'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-br-none'
              }`}
            >
              <p>{message.text}</p>
              
              {/* Product Card Style */}
              {message.type === 'product' && message.data && (
                <div className="mt-3 grid gap-2">
                  {message.data.map((product) => (
                    <div key={product.id} className="group p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 hover:border-blue-300 transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-blue-600">
                            <ShoppingBag size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">{product.name}</p>
                            <p className="text-blue-600 dark:text-blue-400 font-bold text-xs">${product.price}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Contact Card Style */}
              {message.type === 'contact' && message.data && (
                <div className="mt-3 p-3 bg-white/10 rounded-xl border border-white/20 text-xs sm:text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 opacity-70" />
                    <span>{message.data.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 opacity-70" />
                    <span>{message.data.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 opacity-70" />
                    <span>{message.data.hours}</span>
                  </div>
                </div>
              )}
            </div>
            <span className={`text-[10px] text-gray-400 mt-1 ${isBot ? 'ml-1' : 'mr-1 text-right'}`}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => dispatch(toggleChatbot())}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center transition-all hover:shadow-blue-600/40"
      >
        <AnimatePresence mode='wait'>
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
              <MessageCircle className="w-6 h-6" />
              {/* Status Dot */}
              <span className={`absolute top-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full ${backendStatus ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Main Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[95vw] sm:w-[400px] h-[600px] max-h-[80vh] flex flex-col bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700 overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-indigo-600 rounded-full ${backendStatus ? 'bg-green-400' : 'bg-red-400'}`}></div>
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Assistant</h3>
                  <p className="text-xs text-blue-100 flex items-center gap-1">
                    {backendStatus ? 'Online & Ready' : 'Offline Mode'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => dispatch(toggleChatbot())}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning Banner (if offline) */}
            {!backendStatus && (
              <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/30 border-b border-amber-100 dark:border-amber-800">
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                  <WifiOff className="w-3 h-3" />
                  <span>Limited functionality. Server is unreachable.</span>
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 bg-gray-50/50 dark:bg-black/20 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
              <div className="text-center py-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Today</p>
              </div>
              
              {messages.map(renderMessage)}
              
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start mb-4">
                   <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-none p-4 shadow-sm">
                    <div className="flex space-x-1.5">
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
              {/* Quick Actions (Chips) */}
              <div className="flex gap-2 overflow-x-auto pb-3 mb-1 no-scrollbar mask-gradient">
                {chatbotService.getQuickActions().map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleSendMessage(action.action)}
                    className="whitespace-nowrap text-xs font-medium px-3 py-1.5 bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-300 rounded-full border border-blue-100 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={isTyping}
                  className="w-full pl-4 pr-12 py-3.5 bg-gray-100 dark:bg-gray-900 border-transparent rounded-xl focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-all placeholder-gray-400 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isTyping}
                  className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;