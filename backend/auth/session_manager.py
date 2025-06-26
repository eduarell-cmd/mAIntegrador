"""
Gestor de Sesiones con Redis
Este módulo maneja las sesiones de usuario utilizando Redis como almacenamiento.

¿Qué es Redis?
Redis es una base de datos en memoria que es perfecta para cache y sesiones
por su velocidad y capacidad de expiración automática.

¿Por qué usamos Redis para sesiones?
1. Velocidad: Acceso en memoria (muy rápido)
2. Expiración automática: Los datos se eliminan automáticamente
3. Persistencia: Puede guardar datos en disco si es necesario
4. Escalabilidad: Puede manejar múltiples instancias
"""

import redis
import json
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

class SessionManager:
    def __init__(self):
        # Configuración de Redis
        self.redis_host = os.getenv("REDIS_HOST", "localhost")
        self.redis_port = int(os.getenv("REDIS_PORT", 6379))
        self.redis_db = int(os.getenv("REDIS_DB", 0))
        self.redis_password = os.getenv("REDIS_PASSWORD", None)
        
        # Conectar a Redis
        self.redis_client = redis.Redis(
            host=self.redis_host,
            port=self.redis_port,
            db=self.redis_db,
            password=self.redis_password,
            decode_responses=True  # Para que devuelva strings en lugar de bytes
        )
        
        # Prefijos para diferentes tipos de datos
        self.blacklist_prefix = "blacklist:"  # Tokens revocados
        self.session_prefix = "session:"      # Información de sesión
        self.user_sessions_prefix = "user_sessions:"  # Sesiones por usuario
    
    def add_to_blacklist(self, token: str, expires_in: int) -> bool:
        """
        Agrega un token a la blacklist (lista negra)
        
        Args:
            token: Token JWT a revocar
            expires_in: Tiempo en segundos hasta que expire el token
        
        Returns:
            bool: True si se agregó correctamente
        
        ¿Por qué necesitamos una blacklist?
        - Los JWT son stateless (no se pueden invalidar directamente)
        - La blacklist nos permite "revocar" tokens antes de que expiren
        - Es útil para logout y cambio de contraseñas
        """
        try:
            # Usar el token como clave y el tiempo de expiración como TTL
            key = f"{self.blacklist_prefix}{token}"
            self.redis_client.setex(key, expires_in, "revoked")
            return True
        except Exception as e:
            print(f"Error agregando token a blacklist: {e}")
            return False
    
    def is_blacklisted(self, token: str) -> bool:
        """
        Verifica si un token está en la blacklist
        
        Args:
            token: Token JWT a verificar
        
        Returns:
            bool: True si el token está en la blacklist
        """
        try:
            key = f"{self.blacklist_prefix}{token}"
            return self.redis_client.exists(key) > 0
        except Exception as e:
            print(f"Error verificando blacklist: {e}")
            return False
    
    def store_session_info(self, user_id: str, session_data: Dict[str, Any], expires_in: int) -> bool:
        """
        Almacena información de sesión del usuario
        
        Args:
            user_id: ID del usuario
            session_data: Datos de la sesión (IP, user agent, etc.)
            expires_in: Tiempo en segundos hasta que expire
        
        Returns:
            bool: True si se almacenó correctamente
        
        ¿Qué información almacenamos?
        - IP del usuario
        - User Agent (navegador/dispositivo)
        - Timestamp de login
        - Tokens activos
        """
        try:
            key = f"{self.session_prefix}{user_id}"
            session_data["created_at"] = datetime.utcnow().isoformat()
            self.redis_client.setex(key, expires_in, json.dumps(session_data))
            return True
        except Exception as e:
            print(f"Error almacenando sesión: {e}")
            return False
    
    def get_session_info(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Obtiene información de sesión del usuario
        
        Args:
            user_id: ID del usuario
        
        Returns:
            Dict: Información de la sesión o None si no existe
        """
        try:
            key = f"{self.session_prefix}{user_id}"
            data = self.redis_client.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            print(f"Error obteniendo sesión: {e}")
            return None
    
    def add_user_session(self, user_id: str, session_id: str, expires_in: int) -> bool:
        """
        Agrega una sesión activa para un usuario
        
        Args:
            user_id: ID del usuario
            session_id: ID único de la sesión
            expires_in: Tiempo en segundos hasta que expire
        
        Returns:
            bool: True si se agregó correctamente
        
        ¿Por qué trackeamos sesiones por usuario?
        - Permite ver todas las sesiones activas de un usuario
        - Útil para logout de todas las sesiones
        - Seguridad: detectar sesiones sospechosas
        """
        try:
            key = f"{self.user_sessions_prefix}{user_id}"
            # Agregar la sesión a un set (conjunto)
            self.redis_client.sadd(key, session_id)
            # Establecer expiración para el set
            self.redis_client.expire(key, expires_in)
            return True
        except Exception as e:
            print(f"Error agregando sesión de usuario: {e}")
            return False
    
    def remove_user_session(self, user_id: str, session_id: str) -> bool:
        """
        Remueve una sesión específica de un usuario
        
        Args:
            user_id: ID del usuario
            session_id: ID de la sesión a remover
        
        Returns:
            bool: True si se removió correctamente
        """
        try:
            key = f"{self.user_sessions_prefix}{user_id}"
            return self.redis_client.srem(key, session_id) > 0
        except Exception as e:
            print(f"Error removiendo sesión: {e}")
            return False
    
    def get_user_sessions(self, user_id: str) -> list:
        """
        Obtiene todas las sesiones activas de un usuario
        
        Args:
            user_id: ID del usuario
        
        Returns:
            list: Lista de IDs de sesiones activas
        """
        try:
            key = f"{self.user_sessions_prefix}{user_id}"
            return list(self.redis_client.smembers(key))
        except Exception as e:
            print(f"Error obteniendo sesiones de usuario: {e}")
            return []
    
    def logout_user_all_sessions(self, user_id: str) -> bool:
        """
        Cierra todas las sesiones de un usuario
        
        Args:
            user_id: ID del usuario
        
        Returns:
            bool: True si se cerraron todas las sesiones
        """
        try:
            # Obtener todas las sesiones del usuario
            sessions = self.get_user_sessions(user_id)
            
            # Agregar todos los tokens a la blacklist
            for session_id in sessions:
                # Aquí podrías agregar lógica para obtener el token de la sesión
                # Por ahora solo removemos las sesiones
                self.remove_user_session(user_id, session_id)
            
            # Eliminar información de sesión
            session_key = f"{self.session_prefix}{user_id}"
            self.redis_client.delete(session_key)
            
            return True
        except Exception as e:
            print(f"Error cerrando todas las sesiones: {e}")
            return False
    
    def cleanup_expired_sessions(self) -> int:
        """
        Limpia sesiones expiradas (Redis lo hace automáticamente, pero esta función
        puede ser útil para limpieza manual)
        
        Returns:
            int: Número de sesiones limpiadas
        """
        try:
            # Redis maneja la expiración automáticamente con TTL
            # Esta función es más para debugging y monitoreo
            return 0
        except Exception as e:
            print(f"Error en limpieza de sesiones: {e}")
            return 0

# Instancia global del gestor de sesiones
session_manager = SessionManager() 