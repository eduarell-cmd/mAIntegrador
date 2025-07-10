"""
Rutas de Autenticación
Este módulo contiene todos los endpoints relacionados con autenticación:
- Login
- Logout
- Refresh token
- Gestión de sesiones
- Verificación de estado de autenticación

¿Qué endpoints incluye?
1. POST /auth/login - Iniciar sesión
2. POST /auth/logout - Cerrar sesión
3. POST /auth/refresh - Renovar access token
4. GET /auth/me - Obtener usuario actual
5. GET /auth/sessions - Obtener sesiones del usuario
6. DELETE /auth/sessions/{session_id} - Cerrar sesión específica
7. DELETE /auth/sessions - Cerrar todas las sesiones
"""
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from typing import List
import uuid
from datetime import datetime, timedelta

from .jwt_handler import jwt_handler
from .session_manager import session_manager
from .middleware import get_current_user, get_current_user_optional
from .auth_models import (
    TokenResponse, RefreshTokenRequest, LogoutRequest, 
    SessionInfo, UserSessionsResponse, AuthStatus
)
from db.models import LoginInput, UserCreate
from validaciones.validaciones import loginsito, signupsito
from db.db import personas_collection

# Crear el router de autenticación
auth_router = APIRouter(prefix="/auth", tags=["autenticación"])

@auth_router.post("/login", response_model=TokenResponse)
async def login(
    login_data: LoginInput, 
    request: Request
):
    """
    Endpoint para iniciar sesión
    
    ¿Qué hace este endpoint?
    1. Verifica las credenciales del usuario
    2. Crea access token y refresh token
    3. Almacena información de sesión en Redis
    4. Retorna los tokens y datos del usuario
    
    Args:
        login_data: Credenciales de login (email, password)
        request: Request de FastAPI para obtener información del cliente
    
    Returns:
        TokenResponse: Tokens y datos del usuario
    
    Raises:
        HTTPException: Si las credenciales son incorrectas
    """

    # Verificar credenciales usando la función existente
    user_data = await loginsito(login_data)
    
    # Obtener información del cliente
    client_ip = request.client.host
    user_agent = request.headers.get("User-Agent", "Unknown")
    
    # Crear ID único para la sesión
    session_id = str(uuid.uuid4())
    print(f"[login] {user_data}")

    user_data['_id']=str(user_data['_id'])
    # Preparar datos para el token (sin información sensible)
    token_data = {
        "user_id": user_data['_id'],
        "nombre": user_data['nombre'],
        "correo": user_data['correo'],
        "session_id": session_id
    }
    
    # Crear tokens
    access_token = jwt_handler.create_access_token(token_data)
    refresh_token = jwt_handler.create_refresh_token(token_data)
    
    # Calcular tiempo de expiración
    expires_in = jwt_handler.access_token_expire_minutes * 60  # Convertir a segundos
    
    # Almacenar información de sesión en Redis
    session_info = {
        "session_id": session_id,
        "ip_address": client_ip,
        "user_agent": user_agent,
        "access_token": access_token,
        "refresh_token": refresh_token
    }
    
    # Guardar en Redis con expiración
    session_manager.store_session_info(
        str(user_data.get("_id", "")), 
        session_info, 
        expires_in
    )
    
    # Agregar sesión a la lista del usuario
    session_manager.add_user_session(
        str(user_data.get("_id", "")),
        session_id,
        expires_in
    )
    
    # Log del login exitoso
    print(f"Login exitoso: {user_data.get('correo')} desde {client_ip}")
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=expires_in,
        user=user_data
    )
        

@auth_router.post("/signup", response_model=TokenResponse)
async def signup(
    user_data: UserCreate,
    request: Request
):
    """
    Endpoint para registro de usuarios
    
    ¿Qué hace este endpoint?
    1. Crea un nuevo usuario en la base de datos
    2. Crea access token y refresh token
    3. Almacena información de sesión
    4. Retorna los tokens y datos del usuario
    """
    try:
        # Crear usuario usando la función existente
        created_user = await signupsito(user_data)
        
        # Obtener información del cliente
        client_ip = request.client.host
        user_agent = request.headers.get("User-Agent", "Unknown")
        
        # Crear ID único para la sesión
        session_id = str(uuid.uuid4())
        
        # Preparar datos para el token
        token_data = {
            "user_id": str(created_user.id),
            "nombre": created_user.nombre,
            "correo": created_user.correo,
            "session_id": session_id
        }
        
        # Crear tokens
        access_token = jwt_handler.create_access_token(token_data)
        refresh_token = jwt_handler.create_refresh_token(token_data)
        
        # Calcular tiempo de expiración
        expires_in = jwt_handler.access_token_expire_minutes * 60
        
        # Almacenar información de sesión
        session_info = {
            "session_id": session_id,
            "ip_address": client_ip,
            "user_agent": user_agent,
            "access_token": access_token,
            "refresh_token": refresh_token
        }
        
        session_manager.store_session_info(
            str(created_user.id),
            session_info,
            expires_in
        )
        
        session_manager.add_user_session(
            str(created_user.id),
            session_id,
            expires_in
        )
        
        print(f"Registro exitoso: {created_user.correo} desde {client_ip}")
        
        user_dict = created_user.model_dump(by_alias=True)
        if user_dict.get("_id"):
            user_dict["_id"] = str(user_dict["_id"])
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=expires_in,
            user=user_dict
        )
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error en signup: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@auth_router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    request: Request
):
    """
    Endpoint para renovar access token
    
    ¿Qué hace este endpoint?
    1. Verifica el refresh token
    2. Crea un nuevo access token
    3. Opcionalmente crea un nuevo refresh token
    4. Actualiza la información de sesión
    
    ¿Cuándo se usa?
    - Cuando el access token expira
    - Para mantener la sesión activa sin hacer login
    """
    try:
        # Verificar el refresh token
        payload = jwt_handler.verify_token(refresh_data.refresh_token)
        
        # Verificar que sea un refresh token
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token de tipo incorrecto"
            )
        
        # Verificar si está en blacklist
        if session_manager.is_blacklisted(refresh_data.refresh_token):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token revocado"
            )
        
        # Obtener información del cliente
        client_ip = request.client.host
        user_agent = request.headers.get("User-Agent", "Unknown")
        
        # Crear nuevo session ID
        new_session_id = str(uuid.uuid4())
        
        # Preparar datos para el nuevo token
        token_data = {
            "user_id": payload.get("user_id"),
            "nombre": payload.get("nombre"),
            "correo": payload.get("correo"),
            "session_id": new_session_id
        }
        
        # Crear nuevo access token
        new_access_token = jwt_handler.create_access_token(token_data)
        
        # Calcular tiempo de expiración
        expires_in = jwt_handler.access_token_expire_minutes * 60
        
        # Actualizar información de sesión
        session_info = {
            "session_id": new_session_id,
            "ip_address": client_ip,
            "user_agent": user_agent,
            "access_token": new_access_token,
            "refresh_token": refresh_data.refresh_token
        }
        
        session_manager.store_session_info(
            payload.get("user_id"),
            session_info,
            expires_in
        )
        
        # Obtener datos del usuario para la respuesta
        user = await personas_collection.find_one({"_id": payload.get("user_id")})
        
        return TokenResponse(
            access_token=new_access_token,
            refresh_token=refresh_data.refresh_token,
            token_type="bearer",
            expires_in=expires_in,
            user=user
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en refresh token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@auth_router.post("/logout")
async def logout(
    logout_data: LogoutRequest,
    current_user: dict = Depends(get_current_user),
    request: Request = None
):
    """
    Endpoint para cerrar sesión
    
    ¿Qué hace este endpoint?
    1. Revoca el access token actual (lo agrega a blacklist)
    2. Opcionalmente revoca el refresh token
    3. Limpia la información de sesión
    
    Args:
        logout_data: Configuración del logout
        current_user: Usuario autenticado (obtenido del token)
        request: Request de FastAPI
    """
    try:
        # Obtener el token del header
        auth_header = request.headers.get("Authorization")
        access_token = auth_header.split(" ")[1] if auth_header else None
        
        if access_token:
            # Agregar access token a blacklist
            expires_in = jwt_handler.access_token_expire_minutes * 60
            session_manager.add_to_blacklist(access_token, expires_in)
        
        # Si se solicita revocar refresh token
        if logout_data.revoke_refresh_token:
            # Aquí necesitarías obtener el refresh token de la sesión
            # Por ahora solo limpiamos la sesión
            pass
        
        # Limpiar información de sesión
        user_id = current_user.get("user_id")
        session_id = current_user.get("session_id")
        
        if user_id and session_id:
            session_manager.remove_user_session(user_id, session_id)
        
        print(f"Logout exitoso: {current_user.get('correo')}")
        
        return {"message": "Sesión cerrada exitosamente"}
        
    except Exception as e:
        print(f"Error en logout: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@auth_router.get("/me", response_model=AuthStatus)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user)
):
    """
    Endpoint para obtener información del usuario actual
    
    ¿Qué hace este endpoint?
    1. Verifica que el usuario esté autenticado
    2. Retorna información básica del usuario
    3. Útil para verificar el estado de autenticación
    """
    try:
        # Obtener datos completos del usuario
        user = await personas_collection.find_one({"_id": current_user.get("user_id")})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        return AuthStatus(
            is_authenticated=True,
            user=user,
            session_id=current_user.get("session_id")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error obteniendo usuario actual: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@auth_router.get("/sessions", response_model=UserSessionsResponse)
async def get_user_sessions(
    current_user: dict = Depends(get_current_user)
):
    """
    Endpoint para obtener todas las sesiones del usuario
    
    ¿Qué hace este endpoint?
    1. Obtiene todas las sesiones activas del usuario
    2. Retorna información detallada de cada sesión
    3. Útil para gestión de sesiones y seguridad
    """
    try:
        user_id = current_user.get("user_id")
        
        # Obtener sesiones del usuario
        session_ids = session_manager.get_user_sessions(user_id)
        
        sessions = []
        for session_id in session_ids:
            # Obtener información de cada sesión
            session_info = session_manager.get_session_info(user_id)
            if session_info and session_info.get("session_id") == session_id:
                sessions.append(SessionInfo(
                    session_id=session_id,
                    ip_address=session_info.get("ip_address", "Unknown"),
                    user_agent=session_info.get("user_agent", "Unknown"),
                    created_at=datetime.fromisoformat(session_info.get("created_at", datetime.utcnow().isoformat())),
                    last_activity=datetime.utcnow(),
                    is_active=True
                ))
        
        return UserSessionsResponse(
            user_id=user_id,
            sessions=sessions,
            total_sessions=len(sessions)
        )
        
    except Exception as e:
        print(f"Error obteniendo sesiones: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@auth_router.delete("/sessions/{session_id}")
async def logout_session(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Endpoint para cerrar una sesión específica
    
    ¿Qué hace este endpoint?
    1. Cierra una sesión específica del usuario
    2. Útil para cerrar sesiones desde otros dispositivos
    """
    try:
        user_id = current_user.get("user_id")
        
        # Verificar que la sesión pertenezca al usuario
        user_sessions = session_manager.get_user_sessions(user_id)
        
        if session_id not in user_sessions:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sesión no encontrada"
            )
        
        # Remover la sesión
        session_manager.remove_user_session(user_id, session_id)
        
        return {"message": f"Sesión {session_id} cerrada exitosamente"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error cerrando sesión: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@auth_router.delete("/sessions")
async def logout_all_sessions(
    current_user: dict = Depends(get_current_user)
):
    """
    Endpoint para cerrar todas las sesiones del usuario
    
    ¿Qué hace este endpoint?
    1. Cierra todas las sesiones activas del usuario
    2. Útil para logout masivo por seguridad
    """
    try:
        user_id = current_user.get("user_id")
        
        # Cerrar todas las sesiones
        success = session_manager.logout_user_all_sessions(user_id)
        
        if success:
            return {"message": "Todas las sesiones han sido cerradas"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error cerrando sesiones"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error cerrando todas las sesiones: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        ) 