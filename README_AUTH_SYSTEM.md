# 🔐 Sistema de Autenticación JWT + Redis

## 📋 Resumen del Sistema Implementado

He creado un sistema de autenticación completo y robusto para tu proyecto **mAIntegrador** utilizando **JWT (JSON Web Tokens)** y **Redis** para la gestión de sesiones. Este sistema es ideal para aplicaciones que requieren alta escalabilidad, seguridad y soporte para múltiples frontends.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
backend/
├── auth/                          # Módulo de autenticación
│   ├── __init__.py
│   ├── jwt_handler.py            # Manejo de JWT tokens
│   ├── session_manager.py        # Gestión de sesiones con Redis
│   ├── middleware.py             # Middleware de autenticación
│   ├── auth_models.py            # Modelos Pydantic
│   ├── auth_routes.py            # Endpoints de autenticación
│   └── README.md                 # Documentación detallada
├── main.py                       # Aplicación principal (actualizada)
├── requirements.txt              # Dependencias (actualizado)
├── env.example                   # Variables de entorno
└── setup_auth_system.py          # Script de configuración

frontend_web/
├── src/
│   ├── services/
│   │   └── authService.js        # Servicio de autenticación
│   ├── components/
│   │   └── ProtectedRoute.jsx    # Componente de protección de rutas
│   └── view_components/
│       ├── Login.jsx             # Componente de login (actualizado)
│       ├── Dashboard.jsx         # Dashboard de ejemplo
│       └── Dashboard.css         # Estilos del dashboard
```

## 🔐 Características del Sistema

### 1. **Autenticación JWT**
- **Access Tokens**: Vida corta (30 minutos) para acceso a recursos
- **Refresh Tokens**: Vida larga (7 días) para renovar access tokens
- **Firma digital**: Verificación de integridad con algoritmo HS256
- **Expiración automática**: Tokens se invalidan automáticamente

### 2. **Gestión de Sesiones con Redis**
- **Blacklist de tokens**: Revocación inmediata de tokens
- **Múltiples sesiones**: Un usuario puede tener varias sesiones activas
- **Tracking de dispositivos**: Información de IP y User Agent
- **Limpieza automática**: Sesiones expiradas se eliminan automáticamente

### 3. **Seguridad Avanzada**
- **Middleware de protección**: Verificación automática de tokens
- **Dependencias flexibles**: Opcional o requerida según la ruta
- **Manejo de errores**: Respuestas estandarizadas
- **Logging de requests**: Seguimiento de actividad

### 4. **Escalabilidad**
- **Stateless**: JWT permite múltiples instancias del backend
- **Redis Cluster**: Para alta disponibilidad
- **Async operations**: Todas las operaciones son asíncronas

## 🚀 Endpoints Disponibles

### Autenticación
```
POST /auth/login          # Iniciar sesión
POST /auth/signup         # Registrar usuario
POST /auth/logout         # Cerrar sesión
POST /auth/refresh        # Renovar access token
```

### Información de Usuario
```
GET /auth/me              # Obtener usuario actual
GET /auth/sessions        # Obtener sesiones del usuario
```

### Gestión de Sesiones
```
DELETE /auth/sessions/{session_id}  # Cerrar sesión específica
DELETE /auth/sessions               # Cerrar todas las sesiones
```

### Rutas Protegidas de Ejemplo
```
GET /protected-data       # Datos protegidos (requiere autenticación)
GET /public-data          # Datos públicos (opcional autenticación)
GET /perfil/{nombre}      # Perfil protegido (solo propio usuario)
```

## 🔧 Configuración Inicial

### 1. **Instalar Dependencias**
```bash
cd backend
pip install -r requirements.txt
```

### 2. **Instalar y Configurar Redis**

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Windows:**
- Descargar desde: https://redis.io/download
- Instalar e iniciar el servicio

### 3. **Configurar Variables de Entorno**
```bash
cd backend
cp env.example .env
```

Editar `.env`:
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

### 4. **Configuración Automática**
```bash
cd backend
python setup_auth_system.py
```

### 5. **Iniciar el Servidor**
```bash
cd backend
uvicorn main:app --reload
```

## 📱 Integración con Frontend

### React/React Native

El sistema incluye un servicio de autenticación completo:

```javascript
import authService from '../services/authService';

// Login
const result = await authService.login(email, password);

// Request autenticado
const data = await authService.authenticatedRequest('/api/protected');

// Logout
await authService.logout();
```

### Protección de Rutas

```jsx
import ProtectedRoute from '../components/ProtectedRoute';

// Ruta protegida
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>

// Ruta pública (redirige si está autenticado)
<Route 
  path="/login" 
  element={
    <ProtectedRoute requireAuth={false}>
      <Login />
    </ProtectedRoute>
  } 
/>
```

## 🔒 Flujo de Autenticación

### 1. **Login**
```
Usuario → Frontend → POST /auth/login → Backend
Backend → Verificar credenciales → Generar tokens → Redis
Backend → Retornar tokens → Frontend → Almacenar en localStorage
```

### 2. **Acceso a Recursos Protegidos**
```
Frontend → Request con token → Middleware → Verificar token
Middleware → Validar blacklist → Extraer datos usuario → Permitir acceso
```

### 3. **Refresh Token**
```
Frontend → Token expirado → POST /auth/refresh → Backend
Backend → Verificar refresh token → Generar nuevo access token → Frontend
```

### 4. **Logout**
```
Frontend → POST /auth/logout → Backend → Agregar token a blacklist
Backend → Limpiar sesión → Frontend → Limpiar localStorage
```

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

## 🛠️ Uso del Sistema

### Proteger Rutas en el Backend

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

## 🔧 Mantenimiento y Monitoreo

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

## 🎯 Próximos Pasos

1. **Configurar la clave secreta JWT** en el archivo `.env`
2. **Iniciar el servidor backend**: `uvicorn main:app --reload`
3. **Acceder a la documentación**: http://localhost:8000/docs
4. **Probar los endpoints** de autenticación
5. **Integrar el frontend** con el servicio de autenticación
6. **Configurar rutas protegidas** en React/React Native
7. **Implementar manejo de errores** en el frontend
8. **Agregar funcionalidades adicionales** como:
   - Recuperación de contraseña
   - Verificación de email
   - Autenticación de dos factores
   - Roles y permisos

## 📚 Documentación Adicional

- **Documentación detallada**: `backend/auth/README.md`
- **Ejemplos de uso**: Componentes incluidos
- **API Documentation**: http://localhost:8000/docs
- **Script de configuración**: `backend/setup_auth_system.py`

---

**¡El sistema de autenticación está listo para usar!** 🎉

Este sistema proporciona una base sólida y escalable para la autenticación en tu aplicación. Es compatible con múltiples frontends (web y mobile) y puede crecer con tu aplicación. 