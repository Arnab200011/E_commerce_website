import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List


similarity=joblib.load('similarity.pkl.gz')
data=pd.read_csv('Products.csv')

app=FastAPI()

# Define response models
class Product(BaseModel):
    uid: str
    name: str
    original_price: float
    rating: float

class RecommendationResponse(BaseModel):
    recommended_products: List[Product]

@app.post('/recommend',response_model=RecommendationResponse)
def recommend(product_name):
    #getting movie index from dataset
    # prod_index= data[data['name']==product_name].index[0]
    prod_index = data[data['name'].str.contains(product_name, case=False, na=False)].index[0]

    
    #cosine distance of movie with other movies
    dis=similarity[prod_index]
    
    #enumerate list of distances so that we fetch the index and priority 
    #key value denotes that sorting applied based on second value which is distance, top 5 values stored
    prod_list=sorted(list(enumerate(dis)),reverse=True,key=lambda x: x[1])[1:6]

    recommendations = []
    for i in prod_list:
        product = data.iloc[i[0]]
        recommendations.append({
            'uid': str(product['u_id']),
            'name': str(product['name']),
            'original_price': float(product['original_price']),
            'rating': float(product['rating'])
        })

    return {'recommended_products': recommendations}













