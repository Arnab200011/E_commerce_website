from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Initialize app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Memory for simple order/product follow-up
user_context = {}

# Define schema for input
class ChatRequest(BaseModel):
    user_id: str
    message: str

# Simple response mapping
response_map = {
    'hello': 'Hi! How may I help you?',
    'hi': 'Hello! Welcome to our e-commerce store. How can I assist you today?',
    'help': 'I can help you with:\n- Tracking orders\n- Product information\n- Return policy\n- Shipping information\n- Payment methods\nWhat would you like to know?',
    'track order': 'Please provide your order ID.',
    'order': 'Please provide your order ID.',
    'product': 'Please provide the product name you\'re looking for.',
    'return': 'Our return policy allows you to return items within 30 days of purchase for a full refund. Items must be in original condition with tags attached.',
    'shipping': 'We offer free shipping on orders over $100. Standard shipping takes 3-5 business days, and express shipping takes 1-2 business days.',
    'payment': 'We accept all major credit cards, PayPal, Apple Pay, and Google Pay for secure payment processing.',
    'bye': 'Goodbye! Feel free to come back if you have any other questions.',
    'thanks': 'You\'re welcome! Is there anything else I can help you with?',
    'thank you': 'You\'re welcome! Is there anything else I can help you with?'
}

@app.get("/")
async def root():
    return {"message": "Chatbot API is running!"}

@app.post("/chat")
async def chat(req: ChatRequest):
    user_id = req.user_id
    msg = req.message.lower().strip()

    # Handle order/product follow-up
    if user_id in user_context:
        context_type = user_context[user_id]['type']
        if context_type == 'order':
            try:
                order_id = int(msg)
                del user_context[user_id]
                return {"response": f"Order #{order_id} is currently being processed. Estimated delivery: 3-5 business days."}
            except ValueError:
                return {"response": "Please enter a valid numeric order ID."}
        elif context_type == 'product':
            del user_context[user_id]
            return {"response": f"Here is information about {msg}:\n- Price: $29.99\n- In stock: Yes\n- Rating: 4.5/5 stars\n- Free shipping available"}

    # Check for specific keywords
    for keyword, response in response_map.items():
        if keyword in msg:
            if keyword in ['track order', 'order']:
                user_context[user_id] = {'type': 'order'}
            elif keyword == 'product':
                user_context[user_id] = {'type': 'product'}
            return {"response": response}

    # Default response
    return {"response": "I'm here to help! You can ask me about products, orders, returns, shipping, or payment methods. What would you like to know?"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Chatbot is running"}
