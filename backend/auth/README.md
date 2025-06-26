# Sistema de Autenticación JWT + Redis

## 📋 Descripción General

Este sistema de autenticación implementa un flujo completo de autenticación utilizando **JWT (JSON Web Tokens)** y **Redis** para la gestión de sesiones. Es ideal para aplicaciones que requieren alta escalabilidad y seguridad.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

1. **JWT Handler** (`jwt_handler.py`)
   - Generación de access tokens y refresh tokens
   - Verificación y validación de tokens
   - Manejo de expiración de tokens

2. **Session Manager** (`session_manager.py`)
   - Gestión de sesiones en Redis
   - Blacklist de tokens revocados
   - Tracking de sesiones por usuario

3. **Auth Middleware** (`middleware.py`)
   - Protección de rutas
   - Verificación de autenticación
   - Logging de requests

4. **Auth Routes** (`auth_routes.py`)
   - Endpoints de autenticación
   - Gestión de sesiones
   - Operaciones de login/logout

5. **Auth Models** (`auth_models.py`)
   - Modelos Pydantic para validación
   - Estructuras de respuesta estandarizadas

## 🔐 Flujo de Autenticación

### 1. Login
```
Cliente → POST /auth/login → Verificar credenciales → Generar tokens → Almacenar sesión → Retornar tokens
```

### 2. Acceso a Recursos Protegidos
```
Cliente → GET /protected → Verificar token → Validar blacklist → Extraer datos usuario → Permitir acceso
```

### 3. Refresh Token
```
Cliente → POST /auth/refresh → Verificar refresh token → Generar nuevo access token → Actualizar sesión
```

### 4. Logout
```
Cliente → POST /auth/logout → Agregar token a blacklist → Limpiar sesión → Confirmar logout
```

## 🚀 Endpoints Disponibles

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/signup` - Registrar usuario
- `POST /auth/logout` - Cerrar sesión
- `POST /auth/refresh` - Renovar access token

### Información de Usuario
- `GET /auth/me` - Obtener usuario actual
- `GET /auth/sessions` - Obtener sesiones del usuario

### Gestión de Sesiones
- `DELETE /auth/sessions/{session_id}` - Cerrar sesión específica
- `DELETE /auth/sessions` - Cerrar todas las sesiones

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del backend con las siguientes variables:

```env
# JWT
JWT_SECRET_KEY=tu_clave_secreta_super_segura_cambiala_en_produccion

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=

# Seguridad
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
MAX_SESSIONS_PER_USER=5
```

### Instalación de Dependencias

```bash
pip install -r requirements.txt
```

### Configuración de Redis

1. **Instalar Redis:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install redis-server
   
   # macOS
   brew install redis
   
   # Windows
   # Descargar desde https://redis.io/download
   ```

2. **Iniciar Redis:**
   ```bash
   redis-server
   ```

## 📝 Uso del Sistema

### Proteger Rutas

```python
from auth.middleware import get_current_user, get_current_user_optional

# Ruta que requiere autenticación
@app.get("/protected")
async def protected_route(current_user: dict = Depends(get_current_user)):
    return {"message": f"Hola {current_user['nombre']}"}

# Ruta opcional (con o sin autenticación)
@app.get("/public")
async def public_route(current_user: dict = Depends(get_current_user_optional)):
    if current_user:
        return {"message": f"Usuario autenticado: {current_user['nombre']}"}
    else:
        return {"message": "Usuario no autenticado"}
```

### Verificar Roles (Opcional)

```python
from auth.middleware import require_roles

@app.get("/admin")
async def admin_route(current_user: dict = Depends(require_roles(["admin"]))):
    return {"message": "Solo para administradores"}
```

## 🔒 Características de Seguridad

### 1. **Tokens JWT**
- **Access Token**: Vida corta (30 minutos) para acceso a recursos
- **Refresh Token**: Vida larga (7 días) para renovar access tokens
- **Firma digital**: Verificación de integridad
- **Expiración automática**: Tokens se invalidan automáticamente

### 2. **Blacklist de Tokens**
- **Revocación inmediata**: Tokens pueden ser revocados antes de expirar
- **Logout seguro**: Los tokens se invalidan al hacer logout
- **Cambio de contraseña**: Todos los tokens se revocan automáticamente

### 3. **Gestión de Sesiones**
- **Múltiples sesiones**: Un usuario puede tener varias sesiones activas
- **Tracking de dispositivos**: Información de IP y User Agent
- **Limpieza automática**: Sesiones expiradas se eliminan automáticamente

### 4. **Protección de Rutas**
- **Middleware automático**: Verificación automática de tokens
- **Dependencias flexibles**: Opcional o requerida según la ruta
- **Manejo de errores**: Respuestas estandarizadas para errores de autenticación

## 📊 Estructura de Datos

### Token JWT (Access Token)
```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "nombre": "Juan Pérez",
  "correo": "juan@example.com",
  "session_id": "uuid-session-id",
  "exp": 1640995200,
  "iat": 1640993400,
  "type": "access"
}
```

### Respuesta de Login
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "nombre": "Juan Pérez",
    "correo": "juan@example.com",
    "edad": 25,
    "preferencias": ["música", "deportes"],
    "sexo": "M"
  }
}
```

## 🛠️ Mantenimiento y Monitoreo

### Logs del Sistema
El sistema genera logs automáticos para:
- Logins exitosos y fallidos
- Creación de sesiones
- Logouts
- Errores de autenticación

### Limpieza Automática
- **Redis TTL**: Los datos expiran automáticamente
- **Blacklist**: Tokens revocados se eliminan al expirar
- **Sesiones**: Sesiones inactivas se limpian automáticamente

### Monitoreo de Sesiones
```python
# Obtener todas las sesiones de un usuario
sessions = session_manager.get_user_sessions(user_id)

# Verificar sesiones activas
for session_id in sessions:
    session_info = session_manager.get_session_info(user_id)
    print(f"Sesión: {session_id}, IP: {session_info['ip_address']}")
```

## 🔄 Integración con Frontend

### React/React Native
```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo: email, password })
  });
  
  const data = await response.json();
  
  // Guardar tokens
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
  
  return data;
};

// Request autenticado
const authenticatedRequest = async (url) => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.status === 401) {
    // Token expirado, intentar refresh
    await refreshToken();
    return authenticatedRequest(url);
  }
  
  return response.json();
};

// Refresh token
const refreshToken = async () => {
  const refresh_token = localStorage.getItem('refresh_token');
  
  const response = await fetch('/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token })
  });
  
  const data = await response.json();
  
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
};
```

## 🚨 Consideraciones de Seguridad

### 1. **Clave Secreta**
- Cambiar `JWT_SECRET_KEY` en producción
- Usar una clave de al menos 32 caracteres
- No compartir la clave en el código

### 2. **HTTPS**
- Usar HTTPS en producción
- Configurar CORS apropiadamente
- Validar orígenes permitidos

### 3. **Rate Limiting**
- Implementar rate limiting en endpoints de autenticación
- Prevenir ataques de fuerza bruta
- Monitorear intentos de login fallidos

### 4. **Validación de Entrada**
- Sanitizar todos los inputs
- Validar formatos de email y contraseña
- Implementar políticas de contraseñas fuertes

## 🔧 Troubleshooting

### Problemas Comunes

1. **Redis no conecta**
   ```bash
   # Verificar que Redis esté corriendo
   redis-cli ping
   # Debe responder: PONG
   ```

2. **Tokens expiran muy rápido**
   ```python
   # Ajustar en .env
   ACCESS_TOKEN_EXPIRE_MINUTES=60  # Aumentar tiempo
   ```

3. **Errores de CORS**
   ```python
   # Verificar configuración en main.py
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:3000"],  # Frontend URL
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

### Debugging

```python
# Habilitar logs detallados
import logging
logging.basicConfig(level=logging.DEBUG)

# Verificar conexión Redis
from auth.session_manager import session_manager
print(session_manager.redis_client.ping())
```

## 📈 Escalabilidad

### Múltiples Instancias
- **Stateless**: JWT permite múltiples instancias del backend
- **Redis Cluster**: Para alta disponibilidad
- **Load Balancer**: Distribuir carga entre instancias

### Optimizaciones
- **Cache de usuarios**: Cachear datos de usuario frecuentes
- **Connection pooling**: Pool de conexiones Redis
- **Async operations**: Todas las operaciones son asíncronas

## 🤝 Contribución

Para contribuir al sistema:

1. Seguir las convenciones de código
2. Agregar tests para nuevas funcionalidades
3. Documentar cambios en la API
4. Verificar seguridad de nuevas características

---

**Nota**: Este sistema está diseñado para ser robusto y escalable. En producción, asegúrate de configurar adecuadamente todas las variables de entorno y monitorear el rendimiento del sistema. 