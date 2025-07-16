from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import bcrypt

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

MONGO_URL = os.getenv("MONGO_URL")
print("[DEBUG] MONGO_URL usada por el backend:", MONGO_URL)

client = AsyncIOMotorClient(MONGO_URL)
db = client["PruebasIntegrador"]
personas_collection = db["personas"]