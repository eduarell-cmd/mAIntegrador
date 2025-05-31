from fastapi import *
from fastapi.datastructures import FormData
from db.models import *
from db.db import personas_collection
from bson import ObjectId
from bson.errors import InvalidId
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from validaciones.validaciones import *

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
async def perfil(id: str):
    usuario=await get(id)
    return usuario

@app.post("/signup")
async def signup(persona: UserCreate):
    try:
        querylogin = await personas_collection.insert_one(persona.model_dump())
        return {"mensaje":"Jalo el Sign up"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))