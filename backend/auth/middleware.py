"""
Middleware de Autenticación
Este módulo contiene los middlewares y dependencias para proteger rutas
y verificar la autenticación de usuarios.

¿Qué es un middleware?
Un middleware es una función que se ejecuta antes de que llegue la petición
al endpoint. Se usa para autenticación, logging, CORS, etc.

¿Cómo funciona la autenticación?
1. El cliente envía el token JWT en el header Authorization
2. El middleware extrae y verifica el token
3. Si es válido, agrega los datos del usuario a la request
4. Si no es válido, retorna un error 401
"""

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import uuid
from datetime import datetime

from .jwt_handler import jwt_handler
from .session_manager import session_manager

# Esquema de seguridad para extraer el token del header
security = HTTPBearer()

class AuthMiddleware:
    def __init__(self):
        self.security = HTTPBearer()
    
    async def get_current_user(self, credentials: HTTPAuthorizationCredentials = Depends(security)):
        """
        Dependencia que verifica el token JWT y retorna el usuario actual
        
        Args:
            credentials: Credenciales extraídas del header Authorization
        
        Returns:
            dict: Datos del usuario autenticado
        
        Raises:
            HTTPException: Si el token es inválido o está revocado
        
        ¿Cómo se usa?
        @app.get("/protected")
        async def protected_route(current_user = Depends(get_current_user)):
            return {"message": f"Hola {current_user['nombre']}"}
        """
        try:
            # Extraer el token
            token = credentials.credentials
            
            # Verificar si el token está en la blacklist
            if session_manager.is_blacklisted(token):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token revocado"
                )
            
            # Verificar y decodificar el token
            payload = jwt_handler.verify_token(token)
            
            # Verificar que sea un access token
            if payload.get("type") != "access":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token de tipo incorrecto"
                )
            
            return payload
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
    
    async def get_current_user_optional(self, request: Request):
        """
        Dependencia opcional que verifica el token si está presente
        
        Args:
            request: Request de FastAPI
        
        Returns:
            dict: Datos del usuario si está autenticado, None si no
        
        ¿Cuándo usar esta dependencia?
        - Para rutas que pueden ser accedidas con o sin autenticación
        - Para mostrar contenido diferente según si el usuario está logueado
        """
        try:
            # Intentar extraer el token del header
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return None
            
            token = auth_header.split(" ")[1]
            
            # Verificar si el token está en la blacklist
            if session_manager.is_blacklisted(token):
                return None
            
            # Verificar y decodificar el token
            payload = jwt_handler.verify_token(token)
            
            # Verificar que sea un access token
            if payload.get("type") != "access":
                return None
            
            return payload
            
        except Exception:
            return None
    
    def require_roles(self, required_roles: list):
        """
        Decorador para requerir roles específicos
        
        Args:
            required_roles: Lista de roles requeridos
        
        Returns:
            function: Dependencia que verifica roles
        
        ¿Cómo se usa?
        @app.get("/admin")
        async def admin_route(current_user = Depends(require_roles(["admin"]))):
            return {"message": "Solo para administradores"}
        """
        async def role_checker(current_user: dict = Depends(self.get_current_user)):
            user_roles = current_user.get("roles", [])
            
            # Verificar si el usuario tiene al menos uno de los roles requeridos
            if not any(role in user_roles for role in required_roles):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No tienes permisos para acceder a este recurso"
                )
            
            return current_user
        
        return role_checker
    
    async def log_request(self, request: Request, user_id: Optional[str] = None):
        """
        Middleware para logging de requests
        
        Args:
            request: Request de FastAPI
            user_id: ID del usuario si está autenticado
        
        ¿Qué información loggeamos?
        - IP del cliente
        - User Agent
        - Método HTTP
        - URL
        - Usuario (si está autenticado)
        - Timestamp
        """
        # Obtener información del request
        client_ip = request.client.host
        user_agent = request.headers.get("User-Agent", "Unknown")
        method = request.method
        url = str(request.url)
        timestamp = datetime.utcnow().isoformat()
        
        # Log del request
        log_data = {
            "timestamp": timestamp,
            "ip": client_ip,
            "user_agent": user_agent,
            "method": method,
            "url": url,
            "user_id": user_id
        }
        
        print(f"Request: {log_data}")
        
        # Aquí podrías guardar el log en una base de datos o archivo
        return log_data

# Instancia global del middleware
auth_middleware = AuthMiddleware()

# Funciones de conveniencia para usar en las rutas
get_current_user = auth_middleware.get_current_user
get_current_user_optional = auth_middleware.get_current_user_optional
require_roles = auth_middleware.require_roles 