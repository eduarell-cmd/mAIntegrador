from fastapi import *
from fastapi.datastructures import FormData
from db.models import *
from db.db import personas_collection
from bson import ObjectId
from bson.errors import InvalidId
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from auth.session_manager import *
from auth.jwt_handler import *
from validaciones.validaciones import *
import bcrypt

async def get(nombre: str):
    usuario = await personas_collection.find_one({"nombre": nombre})
    if usuario:
        if '_id' in usuario:
            usuario['_id'] = str(usuario['_id'])
        return User(**usuario)
    raise HTTPException(status_code=404, detail="Usuario no encontrado")

async def signupsito(persona:UserCreate):
    try:
        user_data = persona.model_dump()    

        existing_user = await personas_collection.find_one({'correo': user_data["correo"]})
        if existing_user:
            raise HTTPException(
                status_code=409,
                detail="El correo ya está registrado."
            )
        # Limpieza de campos string
        for key, value in user_data.items():
            if isinstance(value, str):
                user_data[key] = value.strip().strip('",')
        
        # Hashear la contraseña después de limpiar
        hashed_password = bcrypt.hashpw(user_data["password"].encode("utf-8"), bcrypt.gensalt())
        user_data["password"] = hashed_password.decode("utf-8")

        # Convertir edad a string si es date
        from datetime import date
        if isinstance(user_data.get("edad"), date):
            user_data["edad"] = user_data["edad"].isoformat()

        result = await personas_collection.insert_one(user_data)
        print("[DEBUG] Resultado de insert_one:", result.inserted_id)
        
        if not result.inserted_id:
            print("[ERROR] No se insertó el usuario")
            raise HTTPException(
                status_code=500,
                detail="Error al guardar en la base de datos"
            )
        
        user_data['_id'] = str(result.inserted_id)
        created_user = User(**user_data)
        print("[DEBUG] Usuario creado00000:", created_user)
        print(created_user.id)
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

async def editprofile(user_id:str, data:UpdateUser):
    try:
        obj_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail=f"El ID de usuario '{user_id}' no es válido.")

    update_data = data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No se proporcionaron datos para actualizar.")
        

    if "password" in update_data and update_data["password"]:
        hashed_password = bcrypt.hashpw(
            update_data["password"].encode('utf-8'), 
            bcrypt.gensalt()
        )
        update_data["password"] = hashed_password.decode('utf-8')

    result = await personas_collection.update_one(
        {"_id": obj_id},
        {"$set": update_data}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail=f"No se encontró el usuario con ID '{user_id}'.")
    return {"message": "Perfil actualizado exitosamente."}

async def logout_user_session(
    logout_data: LogoutRequest, 
    current_user: dict, 
    access_token: str
):
    """
    Contiene la lógica de negocio para cerrar la sesión de un usuario.
    
    Args:
        logout_data (LogoutRequest): Datos del body de la petición.
        current_user (dict): Payload del token del usuario actual.
        access_token (str): El string del token JWT que se está usando.
    """
    try:
        # 1. Agregar el access token a la blacklist para invalidarlo
        #    Asumo que jwt_handler tiene la duración del token
        expires_in = jwt_handler.access_token_expire_minutes * 60
        session_manager.add_to_blacklist(access_token, expires_in)
        
        # 2. Lógica opcional para revocar el refresh token (si aplica)
        if logout_data.revoke_refresh_token:
            # Aquí iría tu lógica para invalidar también el refresh token
            pass
        
        # 3. Limpiar la información de la sesión específica de Redis
        user_id = current_user.get("user_id")
        session_id = current_user.get("session_id")
        
        if user_id and session_id:
            session_manager.remove_user_session(user_id, session_id)
        
        print(f"Logout exitoso: {current_user.get('correo')}")
        
        # 4. Devolver respuesta de éxito
        return {"message": "Sesión cerrada exitosamente"}
        
    except Exception as e:
        print(f"Error en la lógica de logout: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al procesar el logout"
        )