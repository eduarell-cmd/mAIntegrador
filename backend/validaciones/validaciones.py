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
        print("[DEBUG] Ejecutando signupsito")
        user_data = persona.model_dump()
        print("[DEBUG] Datos a insertar:", user_data)
        
        # Limpieza de campos string
        for key, value in user_data.items():
            if isinstance(value, str):
                user_data[key] = value.strip().strip('",')
        
        # Hashear la contraseña después de limpiar
        hashed_password = bcrypt.hashpw(user_data["password"].encode("utf-8"), bcrypt.gensalt())
        print("[DEBUG] Hash generado:", hashed_password.decode("utf-8"))
        user_data["password"] = hashed_password.decode("utf-8")
        
        result = await personas_collection.insert_one(user_data)
        print("[DEBUG] Resultado de insert_one:", result.inserted_id)
        
        if not result.inserted_id:
            print("[ERROR] No se insertó el usuario")
            raise HTTPException(
                status_code=500,
                detail="Error al guardar en la base de datos"
            )
        
        created_user = User(
            id=result.inserted_id,
            **user_data
        )
        print("[DEBUG] Usuario creado:", created_user)
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
    print(f"[loginsito] id:{usuario}")
    try:
        is_valid = bcrypt.checkpw(data.password.encode("utf-8"), usuario["password"].encode("utf-8"))
        print("[DEBUG] ¿Password válida?", is_valid)
    except Exception as e:
        print("[DEBUG] Error en bcrypt.checkpw:", str(e))
        raise HTTPException(status_code=500, detail="Error interno en verificación de contraseña")

    if not is_valid:
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")

    return usuario