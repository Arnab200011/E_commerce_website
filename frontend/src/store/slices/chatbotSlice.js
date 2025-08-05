import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOpen: false,
  messages: [
    {
      id: '1',
      text: 'Hello! I\'m your shopping assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date().toISOString(),
      type: 'text',
    },
  ],
  isTyping: false,
  conversation: [],
};

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState,
  reducers: {
    toggleChatbot: (state) => {
      state.isOpen = !state.isOpen;
    },
    addMessage: (state, action) => {
      const message = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };
      state.messages.push(message);
    },
    setTyping: (state, action) => {
      state.isTyping = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [initialState.messages[0]];
    },
  },
});

export const { toggleChatbot, addMessage, setTyping, clearMessages } = chatbotSlice.actions;
export default chatbotSlice.reducer;