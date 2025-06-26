#!/usr/bin/env python3
"""
Script de Configuración del Sistema de Autenticación
Este script ayuda a configurar automáticamente el sistema de autenticación JWT + Redis.

¿Qué hace este script?
1. Verifica que Redis esté instalado y funcionando
2. Crea un archivo .env con las variables necesarias
3. Verifica las dependencias de Python
4. Proporciona instrucciones de configuración
"""

import os
import sys
import subprocess
import socket
from pathlib import Path

def print_header():
    """Imprime el encabezado del script"""
    print("=" * 60)
    print("🔐 CONFIGURACIÓN DEL SISTEMA DE AUTENTICACIÓN JWT + REDIS")
    print("=" * 60)
    print()

def check_python_version():
    """Verifica la versión de Python"""
    print("🐍 Verificando versión de Python...")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Error: Se requiere Python 3.8 o superior")
        print(f"   Versión actual: {version.major}.{version.minor}.{version.micro}")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} - OK")
    return True

def check_redis_connection():
    """Verifica la conexión a Redis"""
    print("\n🔴 Verificando conexión a Redis...")
    try:
        # Intentar conectar a Redis
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex(('localhost', 6379))
        sock.close()
        
        if result == 0:
            print("✅ Redis está ejecutándose en localhost:6379")
            return True
        else:
            print("❌ Redis no está ejecutándose en localhost:6379")
            return False
    except Exception as e:
        print(f"❌ Error verificando Redis: {e}")
        return False

def install_redis_instructions():
    """Muestra instrucciones para instalar Redis"""
    print("\n📋 INSTRUCCIONES PARA INSTALAR REDIS:")
    print("-" * 40)
    
    if sys.platform.startswith('linux'):
        print("Ubuntu/Debian:")
        print("  sudo apt-get update")
        print("  sudo apt-get install redis-server")
        print("  sudo systemctl start redis-server")
        print("  sudo systemctl enable redis-server")
        
    elif sys.platform.startswith('darwin'):  # macOS
        print("macOS (usando Homebrew):")
        print("  brew install redis")
        print("  brew services start redis")
        
    elif sys.platform.startswith('win'):
        print("Windows:")
        print("  1. Descargar Redis desde: https://redis.io/download")
        print("  2. Instalar Redis")
        print("  3. Iniciar el servicio Redis")
        
    print("\nPara verificar que Redis esté funcionando:")
    print("  redis-cli ping")
    print("  Debe responder: PONG")

def create_env_file():
    """Crea el archivo .env con las variables necesarias"""
    print("\n📝 Creando archivo .env...")
    
    env_content = """# Configuración de JWT
JWT_SECRET_KEY=tu_clave_secreta_super_segura_cambiala_en_produccion

# Configuración de Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=

# Configuración de la aplicación
APP_ENV=development
DEBUG=True

# Configuración de seguridad
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
MAX_SESSIONS_PER_USER=5
"""
    
    env_path = Path(".env")
    if env_path.exists():
        print("⚠️  El archivo .env ya existe")
        response = input("¿Deseas sobrescribirlo? (y/N): ")
        if response.lower() != 'y':
            print("❌ No se creó el archivo .env")
            return False
    
    try:
        with open(env_path, 'w') as f:
            f.write(env_content)
        print("✅ Archivo .env creado exitosamente")
        return True
    except Exception as e:
        print(f"❌ Error creando archivo .env: {e}")
        return False

def check_dependencies():
    """Verifica que las dependencias estén instaladas"""
    print("\n📦 Verificando dependencias...")
    
    required_packages = [
        'fastapi',
        'uvicorn',
        'pymongo',
        'motor',
        'PyJWT',
        'redis',
        'python-jose[cryptography]',
        'passlib[bcrypt]',
        'python-dotenv',
        'bcrypt'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('[', '').replace(']', '').split('[')[0])
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} - NO INSTALADO")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n⚠️  Faltan {len(missing_packages)} dependencias")
        response = input("¿Deseas instalarlas automáticamente? (y/N): ")
        if response.lower() == 'y':
            install_missing_packages(missing_packages)
        else:
            print("📋 Instala manualmente con:")
            print("  pip install -r requirements.txt")
    
    return len(missing_packages) == 0

def install_missing_packages(packages):
    """Instala las dependencias faltantes"""
    print("\n🔧 Instalando dependencias faltantes...")
    
    for package in packages:
        try:
            print(f"Instalando {package}...")
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
            print(f"✅ {package} instalado")
        except subprocess.CalledProcessError as e:
            print(f"❌ Error instalando {package}: {e}")

def test_auth_system():
    """Prueba el sistema de autenticación"""
    print("\n🧪 Probando sistema de autenticación...")
    
    try:
        # Importar módulos del sistema de autenticación
        from auth.jwt_handler import jwt_handler
        from auth.session_manager import session_manager
        
        # Probar JWT Handler
        test_data = {"user_id": "test", "nombre": "Test User"}
        token = jwt_handler.create_access_token(test_data)
        payload = jwt_handler.verify_token(token)
        
        if payload.get("user_id") == "test":
            print("✅ JWT Handler - OK")
        else:
            print("❌ JWT Handler - Error")
            return False
        
        # Probar Session Manager
        if session_manager.redis_client.ping():
            print("✅ Session Manager - OK")
        else:
            print("❌ Session Manager - Error")
            return False
        
        print("✅ Sistema de autenticación funcionando correctamente")
        return True
        
    except Exception as e:
        print(f"❌ Error probando sistema: {e}")
        return False

def show_next_steps():
    """Muestra los siguientes pasos"""
    print("\n🎯 PRÓXIMOS PASOS:")
    print("-" * 30)
    print("1. Configura la clave secreta JWT en el archivo .env")
    print("2. Inicia el servidor backend:")
    print("   cd backend")
    print("   uvicorn main:app --reload")
    print("3. Accede a la documentación de la API:")
    print("   http://localhost:8000/docs")
    print("4. Prueba los endpoints de autenticación:")
    print("   POST /auth/signup")
    print("   POST /auth/login")
    print("   GET /auth/me")
    print("5. Integra el frontend con el servicio de autenticación")
    print("\n📚 Documentación completa en: backend/auth/README.md")

def main():
    """Función principal del script"""
    print_header()
    
    # Verificar Python
    if not check_python_version():
        sys.exit(1)
    
    # Verificar Redis
    if not check_redis_connection():
        print("\n⚠️  Redis no está disponible")
        install_redis_instructions()
        response = input("\n¿Deseas continuar sin Redis? (y/N): ")
        if response.lower() != 'y':
            sys.exit(1)
    
    # Crear archivo .env
    if not create_env_file():
        print("⚠️  No se pudo crear el archivo .env")
    
    # Verificar dependencias
    check_dependencies()
    
    # Probar sistema
    if check_redis_connection():
        test_auth_system()
    
    # Mostrar próximos pasos
    show_next_steps()
    
    print("\n" + "=" * 60)
    print("✅ Configuración completada")
    print("=" * 60)

if __name__ == "__main__":
    main() 