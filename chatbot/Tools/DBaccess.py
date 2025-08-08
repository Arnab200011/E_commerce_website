from pymongo import MongoClient

client=MongoClient("mongodb+srv://manojitsaha788:ah7ybHeyX9kZ3ukz@cluster0.fatxdd1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

db=client['Ecommerce']
products=db['Products']
# orders=db['orders']


def get_product_info(product_name: str) -> str:

    result=products.find_one({"name":product_name})

    if(result):
        return f"Product: {result['name']}\nPrice: ${result['price']}\nFeatures: {result['description']}\nStocks available: {result['stock']}"
    else:
        return 'Sorry, Product is not found!!'
    # return 'yes product available'


def get_order_info(orderID: int)->str:

    # result=products.find_one({"order_id":orderID})

    # if(result):
    #     return f"Your orderID: {result['user_id']}Total amount: ${result['Total_amount']}\nCurrent Status: ${result['status']}"
    # else:
    #     return 'Sorry, OrderID is not found!!'
    return 'yes order available'