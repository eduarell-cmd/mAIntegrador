from fastapi import *
from fastapi.datastructures import FormData
from db.models import *
from db.db import personas_collection, pruebas_collection, emociones_collection
from bson import ObjectId
from bson.errors import InvalidId
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from validaciones.validaciones import *
import bcrypt # type: ignore
import json
from deepFace.faceid import verificar_rostro_laptop
from deepFace.faceid2 import verificar_rostro
from validaciones.horaapi import *
from validaciones.clima import *
from gemini import geminiprompt
from datetime import datetime, date

# Importar el sistema de autenticación
from auth.auth_routes import auth_router
from auth.middleware import get_current_user, get_current_user_optional

app = FastAPI()

# Habilitar CORS para permitir que el frontend se conecte
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir las rutas de autenticación
app.include_router(auth_router)# Evaluar como funciona esta linea

@app.get("/facerecog")
def face():
    resultado = verificar_rostro()

    def convertir(obj):
        if isinstance(obj, dict):
            return {k: convertir(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [convertir(elem) for elem in obj]
        elif hasattr(obj, 'item'):
            return obj.item()
        else:
            return obj

    resultado_convertido = convertir(resultado)
    try:
        print(json.dumps(resultado_convertido, indent=4, ensure_ascii=False))
    except Exception as e:
        print(e)

    return {"mensaje": resultado_convertido}

@app.post("/login", response_model=UserBase)
async def login(data:LoginInput):
    LogedUser= await loginsito(data)
    return LogedUser

@app.get("/perfil/{nombre}",response_model=User)
async def perfil(nombre: str, current_user: dict = Depends(get_current_user)):
    """
    Ruta protegida que requiere autenticación
    Solo usuarios autenticados pueden acceder a su perfil
    """
    # Verificar que el usuario solo pueda acceder a su propio perfil
    if current_user.get("nombre") != nombre:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para acceder a este perfil"
        )
    
    usuario=await get(nombre)
    return usuario

@app.post("/signup", response_model=User)
async def signup(persona: UserCreate):
    print("INICIO SIGNUP")
    CreatedUser = await signupsito(persona)
    print("Usuario creadooooooooooo:", CreatedUser)
    print("CreatedUser:", CreatedUser)
    print("CreatedUser.id:", getattr(CreatedUser, 'id', None))
    
    emocion_doc = {
        "User_id": CreatedUser.id,
        "Emociones": []
    }
    print("Intentando insertar en emociones:", emocion_doc)
    try:
        result = await emociones_collection.insert_one(emocion_doc)
        print("Resultado insert_one:", result.inserted_id)
    except Exception as e:
        print("Error al insertar en emociones:", e)
    
    return CreatedUser

@app.get("/mirror")
async def dayandtime():
    dia, _ = obtener_dia_hora_formateada()
    return {"dia":dia}

@app.get("/weather")
async def weather():
    print("---------------------------------/weather-----------------------------")
    clima = await get_weather()
    print(clima)

    return clima

@app.get("/emocion")
async def emotion():
    resultado = verificar_rostro()

    if resultado["error"]:
        return JSONResponse(status_code=500, content={"error": resultado["error"]})

    return {
        "es_misma_persona": resultado["es_misma_persona"],
        "emociones": resultado.get("emociones", {}),
        "emocion_dominante": resultado.get("emocion_dominante", None)
    }

@app.get("/pruebaemocion")
async def emotion_test():
    resultado = verificar_rostro_laptop()

    if resultado["error"]:
        return JSONResponse(status_code=500, content={"error": resultado["error"]})

    # Guardar en la colección pruebas
    doc = {
        "fecha": datetime.now().strftime("%Y-%m-%d"),
        "emociones": resultado.get("emociones", {}),
        "emocion_dominante": resultado.get("emocion_dominante", None),
        "es_misma_persona": resultado["es_misma_persona"]
    }
    await pruebas_collection.insert_one(doc)

    return {
        "es_misma_persona": resultado["es_misma_persona"],
        "emociones": resultado.get("emociones", {}),
        "emocion_dominante": resultado.get("emocion_dominante", None)
    }

@app.get("/promedioemocion")
async def promedio_emocion():
    # Obtener todas las emociones guardadas
    registros = await pruebas_collection.find({}, {"_id": 0, "emociones": 1}).to_list(None)

    if not registros:
        return {"promedio": None, "total_lecturas": 0}

    suma = {
        "angry": 0,
        "disgust": 0,
        "fear": 0,
        "happy": 0,
        "sad": 0,
        "surprise": 0,
        "neutral": 0,
    }

    total = len(registros)

    # Sumar valores
    for reg in registros:
        for key, val in reg["emociones"].items():
            suma[key] += float(val)

    # Calcular promedio
    promedio = {k: round(v / total, 2) for k, v in suma.items()}

    return {"promedio": promedio, "total_lecturas": total}

@app.get("/geminiprompt")
async def consejo():
    print("➡️ Llamando a geminiprompt()")
    texto = await geminiprompt()
    print(f"✅ Respuesta de geminiprompt: {texto}")
    return {"consejo": texto}

# Nueva ruta protegida de ejemplo
@app.get("/protected-data")
async def get_protected_data(current_user: dict = Depends(get_current_user)):
    """
    Ejemplo de ruta protegida que requiere autenticación
    """
    return {
        "message": f"Hola {current_user.get('nombre')}, esta es información protegida",
        "user_data": {
            "nombre": current_user.get("nombre"),
            "correo": current_user.get("correo"),
            "session_id": current_user.get("session_id")
        }
    }

# Ruta opcional (puede ser accedida con o sin autenticación)
@app.get("/public-data")
async def get_public_data(current_user: dict = Depends(get_current_user_optional)):
    """
    Ejemplo de ruta que puede ser accedida con o sin autenticación
    """
    if current_user:
        return {
            "message": "Información pública",
            "user_authenticated": True,
            "user_name": current_user.get("nombre")
        }
    else:
        return {
            "message": "Información pública",
            "user_authenticated": False
        }

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

