from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from Tools import DBaccess as db

# Load vector store
embedding_model = HuggingFaceEmbeddings(model_name='all-MiniLM-L6-v2')
QAstore = FAISS.load_local(folder_path='QAstore', embeddings=embedding_model, allow_dangerous_deserialization=True)

# Initialize app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Memory for simple order/product follow-up (can be replaced later by real session handling)
user_context = {}

# Define schema for input
class ChatRequest(BaseModel):
    user_id: str
    message: str

@app.post("/chat")
async def chat(req: ChatRequest):
    user_id = req.user_id
    msg = req.message.lower()

    # Handle order/product follow-up
    if user_id in user_context:
        context_type = user_context[user_id]['type']
        if context_type == 'order':
            try:
                order_id = int(msg)
                order_details = db.get_order_info(order_id)
                del user_context[user_id]
                return {"response": f"Here are your order details:\n{order_details}"}
            except ValueError:
                return {"response": "Please enter a valid numeric order ID."}
        elif context_type == 'product':
            product_info = db.get_product_info(msg)
            del user_context[user_id]
            return {"response": f"Here is the product info:\n{product_info}"}

    # Normal query → similarity search
    result = QAstore.similarity_search(msg, k=1)
    answer_type = result[0].metadata.get('Answer', '')

    if answer_type == 'Track Order':
        user_context[user_id] = {'type': 'order'}
        return {"response": "Please provide your order ID."}

    elif answer_type == 'Get Product':
        user_context[user_id] = {'type': 'product'}
        return {"response": "Please provide the product name."}

    return {"response": answer_type}