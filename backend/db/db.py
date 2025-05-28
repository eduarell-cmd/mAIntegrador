from motor.motor_asyncio import AsyncIOMotorClient
import os
MONGO_URL = os.getenv("MONGO_URL","mongodb+srv://Eduardo12:holapapu@clustereduardo.hw818rh.mongodb.net/?retryWrites=true&w=majority&appName=ClusterEduardo")

client = AsyncIOMotorClient(MONGO_URL)
db = client["PruebasIntegrador"]
personas_collection = db["Personas"]