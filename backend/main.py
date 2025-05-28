from fastapi import FastAPI, HTTPException
from backend.db.models import *
from backend.db.db import personas_collection
from bson import ObjectId
from bson.errors import InvalidId
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Habilitar CORS para permitir que el frontend se conecte
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Cambia si React corre en otro puerto
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def welcome ():
    return {"mensaje":"Hola papus, primera mierda de back"}

@app.get("/login")
def login():
    return {"mensaje": "Hola desde el backend papu 😎"}

@app.get("/perfil/{id}",response_model=User)
async def get_users(id: str):
    try:
        object_id = ObjectId(id)
    except InvalidId:
        raise HTTPException(status_code=400,detail="Invalid ID")
    
    usuario = await personas_collection.find_one({"_id": ObjectId(id)})
    if usuario:
        return User(**usuario)
    raise HTTPException(status_code=404, detail="Usuario no encontrado")