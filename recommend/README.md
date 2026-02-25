# E-Commerce Recommendation System

This is a recommendation system for an e-commerce platform built with FastAPI. It provides product recommendations based on similarity metrics.

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. Clone the repository (if not already cloned)
2. Navigate to the project directory:
   ```
   cd recommend
   ```
3. Create a virtual environment (optional but recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
4. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

### Running the Application

To start the server, run:
```
uvicorn app:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Product Recommendations
- **Endpoint**: `/recommend`
- **Method**: POST
- **Description**: Returns product recommendations based on a product name
- **Request Body**:
  ```json
  {
    "product_name": "name of the product"
  }
  ```
- **Response**:
  ```json
  {
    "recommended_products": [
      {
        "uid": "unique identifier of the product",
        "name": "name of the product",
        "original_price": 100.0,
        "rating": 4.5
      }
    ]
  }
  ```

## For Frontend Developers

The recommendation API returns a list of products with their unique identifiers (`uid`). You can use these UIDs to fetch product images from your product image service or database.

Example API call:
```javascript
fetch('/recommend', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ product_name: 'iPhone' }),
})
.then(response => response.json())
.then(data => {
  const products = data.recommended_products;
  products.forEach(product => {
    // Use product.uid to fetch the corresponding product image
    const imageUrl = `/api/images/${product.uid}`; // Adjust endpoint as needed
    // Display product information and image
  });
});
```

The `uid` field in the response can be used to construct image URLs or query your image database/service.