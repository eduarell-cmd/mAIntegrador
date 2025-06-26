"""
Manejador de JWT (JSON Web Tokens)
Este módulo se encarga de crear, validar y refrescar tokens JWT para la autenticación.

¿Qué es JWT?
JWT es un estándar para crear tokens de acceso que permiten autenticar a usuarios
sin necesidad de almacenar información de sesión en el servidor.

Estructura de un JWT:
Header.Payload.Signature

- Header: Contiene el tipo de token y algoritmo de firma
- Payload: Contiene los claims (datos del usuario, expiración, etc.)
- Signature: Firma digital que verifica la integridad del token
"""

import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
import os
from dotenv import load_dotenv

load_dotenv()

class JWTHandler:
    def __init__(self):
        # Clave secreta para firmar los tokens (en producción debe estar en variables de entorno)
        self.secret_key = os.getenv("JWT_SECRET_KEY", "tu_clave_secreta_super_segura_cambiala_en_produccion")
        print(f"[DEBUG] JWT_SECRET_KEY usada por el backend: {self.secret_key}")
        
        # Algoritmo de firma
        self.algorithm = "HS256"
        
        # Tiempo de expiración de tokens
        self.access_token_expire_minutes = 30  # 30 minutos
        self.refresh_token_expire_days = 7     # 7 días
    
    def create_access_token(self, data: Dict[str, Any]) -> str:
        """
        Crea un token de acceso JWT
        
        Args:
            data: Diccionario con los datos del usuario (normalmente user_id, email, etc.)
        
        Returns:
            str: Token JWT codificado
        
        ¿Cómo funciona?
        1. Toma los datos del usuario
        2. Agrega timestamp de creación y expiración
        3. Firma el token con la clave secreta
        4. Retorna el token codificado
        """
        to_encode = data.copy()
        
        # Agregar timestamp de expiración
        expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),  # Issued at (cuando se creó)
            "type": "access"  # Tipo de token
        })
        
        # Crear y firmar el token
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def create_refresh_token(self, data: Dict[str, Any]) -> str:
        """
        Crea un token de refresco JWT (válido por más tiempo)
        
        Args:
            data: Diccionario con los datos del usuario
        
        Returns:
            str: Token de refresco JWT
        
        ¿Por qué necesitamos refresh tokens?
        - Los access tokens tienen vida corta por seguridad
        - Los refresh tokens permiten obtener nuevos access tokens sin volver a hacer login
        - Si un refresh token se compromete, se puede revocar sin afectar la sesión actual
        """
        to_encode = data.copy()
        
        # Agregar timestamp de expiración (más largo que access token)
        expire = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh"  # Tipo de token
        })
        
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """
        Verifica y decodifica un token JWT
        
        Args:
            token: Token JWT a verificar
        
        Returns:
            Dict: Datos decodificados del token
        
        Raises:
            HTTPException: Si el token es inválido o ha expirado
        
        ¿Qué verifica?
        1. Que el token esté bien formado
        2. Que la firma sea válida
        3. Que no haya expirado
        4. Que el algoritmo sea correcto
        """
        try:
            # Decodificar el token
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            # Verificar que el token no haya expirado
            exp = payload.get("exp")
            if exp is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token sin fecha de expiración"
                )
            
            # Verificar que no haya expirado
            if datetime.utcnow() > datetime.fromtimestamp(exp):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token expirado"
                )
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expirado"
            )
        except jwt.JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
    
    def refresh_access_token(self, refresh_token: str) -> str:
        """
        Crea un nuevo access token usando un refresh token válido
        
        Args:
            refresh_token: Token de refresco válido
        
        Returns:
            str: Nuevo access token
        
        ¿Cómo funciona el refresh?
        1. Verifica que el refresh token sea válido
        2. Extrae los datos del usuario
        3. Crea un nuevo access token
        4. Retorna el nuevo token
        """
        # Verificar el refresh token
        payload = self.verify_token(refresh_token)
        
        # Verificar que sea un refresh token
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token de tipo incorrecto"
            )
        
        # Extraer datos del usuario (sin campos de JWT)
        user_data = {
            key: value for key, value in payload.items() 
            if key not in ["exp", "iat", "type"]
        }
        
        # Crear nuevo access token
        return self.create_access_token(user_data)

# Instancia global del manejador JWT
jwt_handler = JWTHandler() 