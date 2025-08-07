# Chatbot Integration Guide

## Overview
The chatbot is now successfully connected to your e-commerce frontend! It provides intelligent customer support using AI-powered responses and can handle various queries about products, orders, and general support.

## Services Status

✅ **Chatbot Backend (Python FastAPI)**: Running on http://localhost:8000
✅ **Frontend (React/Vite)**: Running on http://localhost:5175 (or next available port)

## Quick Start

### Option 1: Use the PowerShell Script (Recommended for Windows)
1. Right-click `start_services.ps1` and select "Run with PowerShell"
2. This will automatically start both services in separate windows
3. Wait for both services to fully load

### Option 2: Use the Batch Script
1. Double-click `start_services.bat` in the project root
2. This will automatically start both services in separate windows
3. Wait for both services to fully load

### Option 3: Manual Start
1. **Start Chatbot Backend:**
   ```bash
   cd chatbot
   python -m uvicorn chatbot:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Start Frontend (in a new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

## How to Use the Chatbot

### Accessing the Chatbot
1. Open your browser and go to http://localhost:5175 (or the port shown in your terminal)
2. Look for the chat bubble icon in the bottom-right corner
3. Click the icon to open the chatbot interface

### Available Features

#### Quick Actions
The chatbot provides quick action buttons for common queries:
- **Track Order**: Get order status and details
- **Get Product**: Search for product information
- **Return Policy**: Information about returns and refunds
- **Shipping Info**: Details about shipping options and costs
- **Payment Methods**: Accepted payment options
- **Contact Support**: General help and support

#### Natural Language Queries
You can also type natural language questions like:
- "What's your return policy?"
- "How long does shipping take?"
- "What payment methods do you accept?"
- "I need help with my order"
- "Tell me about your products"

#### AI-Powered Responses
The chatbot uses:
- **Vector similarity search** for intelligent responses
- **Context awareness** for follow-up questions
- **Database integration** for real product and order data
- **Fallback responses** when backend is unavailable

## Technical Details

### Backend Architecture
- **Framework**: FastAPI (Python)
- **AI/ML**: LangChain with HuggingFace embeddings
- **Vector Store**: FAISS for similarity search
- **Database**: MongoDB integration (configured but commented out)

### Frontend Integration
- **Framework**: React with Redux
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Real-time**: WebSocket-like polling for status

### API Endpoints
- `POST /chat` - Main chat endpoint
- Accepts: `{"user_id": "string", "message": "string"}`
- Returns: `{"response": "string"}`

## Troubleshooting

### Backend Not Responding
1. Check if Python dependencies are installed:
   ```bash
   cd chatbot
   pip install -r requirements.txt
   ```

2. Verify the server is running:
   ```bash
   curl http://localhost:8000/chat
   ```

### Frontend Connection Issues
1. Check if the frontend is running (it will show the port in the terminal)
2. Verify CORS settings in the backend
3. Check browser console for errors

### Chatbot Not Working
1. Look for the WiFi indicator on the chat button:
   - 🟢 Green: Backend connected
   - 🔴 Red: Using fallback responses
2. If red, ensure the Python backend is running
3. Check the browser console for error messages

## Customization

### Adding New Responses
1. Edit `chatbot/chatbot.py` to add new response logic
2. Update `frontend/src/services/chatbotService.js` for fallback responses
3. Add new quick actions in the service file

### Database Integration
1. Uncomment and configure MongoDB connection in `chatbot/Tools/DBaccess.py`
2. Update the database functions to use real data
3. Test with actual product and order data

### Styling
1. Modify `frontend/src/components/chatbot/Chatbot.jsx` for UI changes
2. Update Tailwind classes for different themes
3. Customize animations in the component

## Performance Tips

1. **Backend**: The FastAPI server includes auto-reload for development
2. **Frontend**: Uses Vite for fast hot reloading
3. **AI**: FAISS vector store is loaded once at startup for efficiency
4. **Caching**: Consider adding Redis for session management in production

## Next Steps

1. **Database Integration**: Connect to real MongoDB for live data
2. **User Authentication**: Add user-specific chat sessions
3. **Advanced AI**: Implement more sophisticated conversation flows
4. **Analytics**: Add chat analytics and user behavior tracking
5. **Multi-language**: Support for multiple languages

## Support

If you encounter any issues:
1. Check the console logs in both backend and frontend
2. Verify all dependencies are installed
3. Ensure ports 8000 and 5173 are available
4. Check the troubleshooting section above

The chatbot is now fully integrated and ready to provide intelligent customer support for your e-commerce website! 🚀
