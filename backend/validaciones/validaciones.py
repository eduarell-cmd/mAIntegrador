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

async def get(nombre: str):
    usuario = await personas_collection.find_one({"nombre": nombre})
    if usuario:
        return User(**usuario)
    raise HTTPException(status_code=404, detail="Usuario no encontrado")

async def signupsito(persona:UserCreate):
    try:
        # Convertir UserCreate a diccionario para guardar en la base de datos
        user_data = persona.model_dump()
        
        hashed_password = bcrypt.hashpw(user_data["password"].encode("utf-8"), bcrypt.gensalt())
        user_data["password"] = hashed_password.decode("utf-8")  # Lo convertimos a string para guardarlo en Mongo

        # Guardar en la base de datos
        result = await personas_collection.insert_one(user_data)
        
        # Verificar si se guardó correctamente
        if not result.inserted_id:
            raise HTTPException(
                status_code=500,
                detail="Error al guardar en la base de datos"
            )
        
        # Crear objeto User con el ID generado
        created_user = User(
            id=result.inserted_id,
            **user_data
        )
        
        return created_user
    except Exception as e:
        print("Error en signup:", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Error al procesar los datos: {str(e)}"
        )
    
async def loginsito(data:LoginInput):
    usuario = await personas_collection.find_one({"correo": data.correo})

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if not bcrypt.checkpw(data.password.encode("utf-8"), usuario["password"].encode("utf-8")):
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")

    return UserBase(**usuario)