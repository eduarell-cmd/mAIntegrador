from fastapi import *
from fastapi.datastructures import FormData
from db.models import *
from db.db import personas_collection
from bson import ObjectId
from bson.errors import InvalidId
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from validaciones.validaciones import *
import bcrypt

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

@app.post("/login", response_model=UserBase)
async def login(data:LoginInput):
    LogedUser= await loginsito(data)
    return LogedUser

@app.get("/perfil/{nombre}",response_model=User)
async def perfil(nombre: str):
    usuario=await get(nombre)
    return usuario

@app.post("/signup", response_model=User)
async def signup(persona: UserCreate):
    CreatedUser = await signupsito(persona)
    return CreatedUser
    
# @app.post("/signup", response_model=User)
# async def signup(persona: UserCreate):
#     try:
#         # Mostrar los datos recibidos en la consola
#         print("Datos recibidos en signup:")
#         print("Nombre:", persona.nombre)
#         print("Edad:", persona.edad)
#         print("Preferencias:", persona.preferencias)
#         print("Sexo:", persona.sexo)
#         print("Correo:", persona.correo)
#         print("Palabra de seguridad:", persona.palabra_de_seguridad)
#         print("Password:", persona.password)
        
#         # Convertir UserCreate a diccionario para guardar en la base de datos
#         user_data = persona.model_dump()
        
#         # Guardar en la base de datos
#         result = await personas_collection.insert_one(user_data)
#         print(result)
        
#         # Verificar si se guardó correctamente
#         if not result.inserted_id:
#             raise HTTPException(
#                 status_code=500,
#                 detail="Error al guardar en la base de datos"
#             )
        
#         # Crear objeto User con el ID generado
#         created_user = User(
#             id=result.inserted_id,
#             **user_data
#         )
        
#         return created_user
#     except HTTPException as he:
#         print("Error de validación:", str(he.detail))
#         raise he
#     except Exception as e:
#         print("Error en signup:", str(e))
#         raise HTTPException(
#             status_code=500,
#             detail=f"Error al procesar el registro: {str(e)}"
#         )

