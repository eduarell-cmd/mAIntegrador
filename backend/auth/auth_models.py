"""
Modelos de Autenticación
Este módulo contiene los modelos Pydantic para las respuestas de autenticación,
tokens y datos de sesión.

¿Qué son los modelos Pydantic?
Los modelos Pydantic son clases que definen la estructura de datos
y proporcionan validación automática. Son muy útiles para APIs REST.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# auth_models.py (al final del archivo)
# ... (modelos existentes) ...

class QRGenerateResponse(BaseModel):
    """
    Modelo para la respuesta de generación del QR.
    
    ¿Qué contiene esta respuesta?
    - session_id: ID único de la sesión QR.
    - qr_data: URL de deep link para el código QR.
    """
    session_id: str = Field(..., description="ID único de la sesión QR")
    qr_data: str = Field(..., description="URL de deep link para el código QR")

class QRStatusResponse(BaseModel):
    """
    Modelo para la respuesta de estado de la sesión QR.
    
    ¿Qué contiene esta respuesta?
    - status: Estado de la sesión ('pending', 'authenticated').
    - token: Token de acceso JWT si la sesión está autenticada.
    """
    status: str = Field(..., description="Estado de la sesión QR")
    token: Optional[str] = Field(None, description="Token de acceso si el login fue exitoso")

class TokenResponse(BaseModel):
    """
    Modelo para la respuesta de login/refresh token
    
    ¿Qué contiene esta respuesta?
    - access_token: Token para acceder a recursos protegidos
    - refresh_token: Token para renovar el access token
    - token_type: Tipo de token (siempre "bearer")
    - expires_in: Tiempo de expiración en segundos
    """
    access_token: str = Field(..., description="Token de acceso JWT")
    refresh_token: str = Field(..., description="Token de refresco JWT")
    token_type: str = Field(default="bearer", description="Tipo de token")
    expires_in: int = Field(..., description="Tiempo de expiración en segundos")
    user: dict = Field(..., description="Datos del usuario")

class RefreshTokenRequest(BaseModel):
    """
    Modelo para solicitar un nuevo access token
    
    ¿Cuándo se usa?
    - Cuando el access token expira
    - Para renovar la sesión sin hacer login nuevamente
    """
    refresh_token: str = Field(..., description="Token de refresco válido")

class LogoutRequest(BaseModel):
    """
    Modelo para logout
    
    ¿Qué hace el logout?
    - Revoca el access token actual
    - Opcionalmente revoca el refresh token
    """
    revoke_refresh_token: bool = Field(default=False, description="Si revocar también el refresh token")

class SessionInfo(BaseModel):
    """
    Modelo para información de sesión
    
    ¿Qué información contiene?
    - ID de la sesión
    - IP del cliente
    - User Agent
    - Fecha de creación
    - Última actividad
    """
    session_id: str = Field(..., description="ID único de la sesión")
    ip_address: str = Field(..., description="Dirección IP del cliente")
    user_agent: str = Field(..., description="User Agent del navegador/dispositivo")
    created_at: datetime = Field(..., description="Fecha de creación de la sesión")
    last_activity: datetime = Field(..., description="Última actividad de la sesión")
    is_active: bool = Field(default=True, description="Si la sesión está activa")

class UserSessionsResponse(BaseModel):
    """
    Modelo para la respuesta de sesiones de usuario
    
    ¿Qué contiene?
    - Lista de todas las sesiones activas del usuario
    - Información de cada sesión
    """
    user_id: str = Field(..., description="ID del usuario")
    sessions: List[SessionInfo] = Field(..., description="Lista de sesiones activas")
    total_sessions: int = Field(..., description="Total de sesiones activas")

class AuthStatus(BaseModel):
    """
    Modelo para verificar el estado de autenticación
    
    ¿Cuándo se usa?
    - Para verificar si el usuario está autenticado
    - Para obtener información básica del usuario
    """
    is_authenticated: bool = Field(..., description="Si el usuario está autenticado")
    user: Optional[dict] = Field(None, description="Datos del usuario si está autenticado")
    session_id: Optional[str] = Field(None, description="ID de la sesión actual")

class LoginHistory(BaseModel):
    """
    Modelo para historial de logins
    
    ¿Qué información contiene?
    - Fecha y hora del login
    - IP del cliente
    - User Agent
    - Éxito o fallo del login
    """
    timestamp: datetime = Field(..., description="Fecha y hora del login")
    ip_address: str = Field(..., description="Dirección IP del cliente")
    user_agent: str = Field(..., description="User Agent")
    success: bool = Field(..., description="Si el login fue exitoso")
    failure_reason: Optional[str] = Field(None, description="Razón del fallo si aplica")

class SecuritySettings(BaseModel):
    """
    Modelo para configuraciones de seguridad
    
    ¿Qué configuraciones incluye?
    - Duración de access tokens
    - Duración de refresh tokens
    - Configuraciones de blacklist
    """
    access_token_expire_minutes: int = Field(default=30, description="Duración de access tokens en minutos")
    refresh_token_expire_days: int = Field(default=7, description="Duración de refresh tokens en días")
    max_sessions_per_user: int = Field(default=5, description="Máximo número de sesiones por usuario")
    enable_blacklist: bool = Field(default=True, description="Si habilitar la blacklist de tokens")

class PasswordChangeRequest(BaseModel):
    """
    Modelo para cambio de contraseña
    
    ¿Qué incluye?
    - Contraseña actual
    - Nueva contraseña
    - Confirmación de nueva contraseña
    """
    current_password: str = Field(..., description="Contraseña actual")
    new_password: str = Field(..., description="Nueva contraseña")
    confirm_password: str = Field(..., description="Confirmación de nueva contraseña")

class PasswordResetRequest(BaseModel):
    """
    Modelo para solicitar reset de contraseña
    
    ¿Qué incluye?
    - Email del usuario
    """
    email: str = Field(..., description="Email del usuario")

class PasswordResetConfirm(BaseModel):
    """
    Modelo para confirmar reset de contraseña
    
    ¿Qué incluye?
    - Token de reset
    - Nueva contraseña
    """
    reset_token: str = Field(..., description="Token de reset de contraseña")
    new_password: str = Field(..., description="Nueva contraseña")
    confirm_password: str = Field(..., description="Confirmación de nueva contraseña") 