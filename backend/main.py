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
async def signup(persona: User):
    try:
        # Mostrar los datos recibidos en la consola
        print("Datos recibidos en signup:")
        print("Nombre:", persona.nombre)
        print("Edad:", persona.edad)
        print("Preferencias:", persona.preferencias)
        print("Sexo:", persona.sexo)
        print("Correo:", persona.correo)
        print("Palabra de seguridad:", persona.palabra_de_seguridad)
        print("Password:", persona.password)
        
        # Validar que todos los campos requeridos estén presentes
        if not all([persona.nombre, persona.edad, persona.sexo, persona.correo, persona.palabra_de_seguridad, persona.password]):
            raise HTTPException(
                status_code=422,
                detail="Todos los campos son requeridos"
            )
        
        # Guardar en la base de datos
        querylogin = await personas_collection.insert_one(persona.model_dump())
        
        return {
            "mensaje": "Datos recibidos correctamente",
            "datos_recibidos": persona.model_dump()
        }
    except HTTPException as he:
        print("Error de validación:", str(he.detail))
        raise he
    except Exception as e:
        print("Error en signup:", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Error al procesar el registro: {str(e)}"
        )