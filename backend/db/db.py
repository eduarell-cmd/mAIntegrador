from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
MONGO_URL = os.getenv("MONGO_URL")

client = AsyncIOMotorClient(MONGO_URL)
db = client["PruebasIntegrador"]
personas_collection = db["Personas"]