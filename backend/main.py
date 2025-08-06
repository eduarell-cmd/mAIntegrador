from fastapi import *
from fastapi.datastructures import FormData
from db.models import *
from db.db import personas_collection, pruebas_collection, emociones_collection, consejos_collection
from bson import ObjectId
from bson.errors import InvalidId
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from validaciones.validaciones import *
import bcrypt # type: ignore
import json
from deepFace.face_handler import verificar_rostro
from deepFace.faceid import verificar_rostro_laptop
from validaciones.horaapi import *
from validaciones.clima import *
from gemini import geminiprompt, normalizar_emocion
from datetime import datetime, timedelta
from collections import Counter
from auth.session_manager import *
from auth.jwt_handler import *
# Importar el sistema de autenticación
from auth.auth_routes import auth_router, logout
from auth.middleware import get_current_user, get_current_user_optional
app = FastAPI()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, data: dict):
        # Envía los datos a todas las conexiones activas (espejos conectados)
        message = json.dumps(data)
        for connection in self.active_connections:
            await connection.send_text(message)

# Crea una instancia del manejador
manager = ConnectionManager()

# Endpoint para que Mirror.jsx se conecte
@app.websocket("/ws/mirror")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Mantenemos la conexión abierta escuchando
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Habilitar CORS para permitir que el frontend se conecte
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir las rutas de autenticación
app.include_router(auth_router)# Evaluar como funciona esta linea

@app.post("/login", response_model=UserBase)
async def login(data:LoginInput):
    LogedUser= await loginsito(data)
    return LogedUser

@app.get("/perfil/{nombre}",response_model=User)
async def perfil(nombre: str, current_user: dict = Depends(get_current_user)):
    """
    Ruta protegida que requiere autenticación
    Solo usuarios autenticados pueden acceder a su perfil
    """
    # Verificar que el usuario solo pueda acceder a su propio perfil
    if current_user.get("nombre") != nombre:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para acceder a este perfil"
        )
    
    usuario=await get(nombre)
    return usuario

@app.post("/signup", response_model=User)
async def signup(persona: UserCreate):
    print("INICIO SIGNUP")
    CreatedUser = await signupsito(persona)
    print("Usuario creadooooooooooo:", CreatedUser)
    print("CreatedUser:", CreatedUser)
    print("CreatedUser.id:", getattr(CreatedUser, 'id', None))
    
    emocion_doc = {
        "User_id": CreatedUser.id,
        "Emociones": []
    }
    print("Intentando insertar en emociones:", emocion_doc)
    try:
        result = await emociones_collection.insert_one(emocion_doc)
        print("Resultado insert_one:", result.inserted_id)
    except Exception as e:
        print("Error al insertar en emociones:", e)
    
    return CreatedUser

@app.get("/mirror")
async def dayandtime():
    dia, _ = obtener_dia_hora_formateada()
    return {"dia":dia}

@app.get("/weather")
async def weather():
    print("---------------------------------/weather-----------------------------")
    clima = await get_weather()
    print(clima)

    return clima

@app.post("/pruebaemocion")
async def emotion_test(data: dict = Body(...)):
    user_id = data.get("user_id")
    image_url = data.get("image_url") # Asegúrate que el cliente envíe la URL de la imagen de perfil

    if not image_url:
        return JSONResponse(status_code=400, content={"error": "Falta image_url en la petición"})

    # Llamada a la nueva función unificada
    resultado = verificar_rostro(image_url=image_url)

    if resultado["error"]:
        return JSONResponse(status_code=500, content={"error": resultado["error"]})
    
    if not resultado["es_misma_persona"]:
        return JSONResponse(status_code=403, content={"error": "El rostro no coincide con el perfil."})
    # Guardar en la colección pruebas (opcional, si lo necesitas)
    doc = {
        "fecha": datetime.now().strftime("%Y-%m-%d"),
        "emociones": resultado.get("emociones", {}),
        "emocion_dominante": resultado.get("emocion_dominante", None),
        "es_misma_persona": resultado["es_misma_persona"]
    }
    await pruebas_collection.insert_one(doc)

    # Guardar en la colección emociones
    emocion_obj = {
        "fecha": datetime.now().strftime("%Y-%m-%d"),
        "Emociones_Acumuladas": resultado.get("emociones", {}),
        "emocion_dominante": resultado.get("emocion_cruda")
    }
    if user_id:
        try:
            await emociones_collection.update_one(
                {"User_id": user_id},
                {"$push": {"Emociones": emocion_obj}}
            )
        except Exception as e:
            print(f"[emociones] Error al guardar emoción: {e}")
    else:
        print("[emociones] No se recibió user_id en la petición")

    return {
        "es_misma_persona": resultado["es_misma_persona"],
        "emociones": resultado.get("emociones", {}),
        "emocion_dominante": resultado.get("emocion_dominante", None)
    }

@app.get("/promedioemocion/{user_id}")
async def promedio_emocion(user_id: str):
    registro = await emociones_collection.find_one({"User_id": user_id})

    if not registro or "Emociones" not in registro or not registro["Emociones"]:
        return {
            "promedio": {"angry": 0, "disgust": 0, "fear": 0, "happy": 0, "sad": 0, "surprise": 0, "neutral": 0},
            "total_lecturas": 0,
            "emocion_dominante_hoy": None
        }

    hoy = datetime.now().strftime("%Y-%m-%d")
    
    suma_promedios = {"angry": 0, "disgust": 0, "fear": 0, "happy": 0, "sad": 0, "surprise": 0, "neutral": 0}
    total_lecturas_hoy = 0
    lista_dominantes_hoy = []

    for entrada in registro["Emociones"]:
        if entrada.get("fecha") == hoy:
            # Acumular para el promedio de las barras
            if isinstance(entrada.get("Emociones_Acumuladas"), dict):
                for key, val in entrada["Emociones_Acumuladas"].items():
                    if key in suma_promedios:
                        try:
                            suma_promedios[key] += float(val)
                        except (ValueError, TypeError):
                            pass
                total_lecturas_hoy += 1

            # Guardar la emoción dominante de esta lectura para el cálculo de frecuencia
            if entrada.get("emocion_dominante"):
                lista_dominantes_hoy.append(entrada["emocion_dominante"])

    # Calcular el promedio para las barras
    promedio_barras = {k: round(v / total_lecturas_hoy, 2) if total_lecturas_hoy > 0 else 0 for k, v in suma_promedios.items()}
    
    # Calcular la emoción dominante del día
    emocion_dominante_final = None 
    if lista_dominantes_hoy:
        emocion_dominante_final = Counter(lista_dominantes_hoy).most_common(1)[0][0]

    return {
        "promedio": promedio_barras, 
        "total_lecturas": total_lecturas_hoy,
        "emocion_dominante_hoy": emocion_dominante_final # Devolvemos la emoción correcta
    }

@app.post("/guardar_consejo")
async def guardar_consejo(data: dict = Body(...)):
    user_id = data.get("user_id")
    emocion_foto = data.get("emocion_foto")
    emocion = await normalizar_emocion(data.get("emocion"))
    consejo = data.get("consejo")

    if not user_id:
        raise HTTPException(status_code=400, detail="Falta el user_id")

    # Convertir a str para almacenar limpio
    doc = {
        "user_id": str(user_id),
        "emocion_foto": emocion_foto,
        "emocion": emocion,
        "consejo": consejo,
        "fecha": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    try:
        result = await consejos_collection.insert_one(doc)
        return {
            "message": "Consejo guardado exitosamente",
            "data": {**doc, "_id": str(result.inserted_id)}  # convertir también el _id
        }
    except Exception as e:
        print(f"Error guardando consejo: {e}")
        raise HTTPException(status_code=500, detail="Error guardando consejo")

@app.get("/consejos_hoy/{user_id}")
async def consejos_hoy(user_id: str):
    hoy = datetime.now().strftime("%Y-%m-%d")
    # Buscar consejos del día
    consejos = await consejos_collection.find({
        "user_id": user_id,
        "fecha": {"$regex": f"^{hoy}"},
        "consejo": {"$ne": None}
    }).to_list(length=100)

    # Convertir ObjectId a str
    for c in consejos:
        c["_id"] = str(c["_id"])
    return {"consejos": consejos}

@app.get("/tracker/{user_id}")
async def get_tracker(user_id: str):
    # Buscar el documento del usuario
    doc = await emociones_collection.find_one({"User_id": user_id}, {"_id": 0, "Emociones": 1})
    
    if not doc or "Emociones" not in doc:
        return {"dias": []}

    hoy = datetime.now()
    mes_actual = hoy.month
    anio_actual = hoy.year

    dias_usados = set()

    for emo in doc["Emociones"]:
        fecha_raw = emo.get("fecha")
        fecha = None

        # Manejar si la fecha viene como string en formato YYYY-MM-DD
        if isinstance(fecha_raw, str):
            try:
                fecha = datetime.strptime(fecha_raw, "%Y-%m-%d")
            except ValueError:
                # Si por error tiene hora, intenta parsear con otro formato
                try:
                    fecha = datetime.strptime(fecha_raw, "%Y-%m-%d %H:%M:%S")
                except ValueError:
                    continue  # Ignorar fechas mal formateadas

        # Manejar si la fecha viene como objeto datetime desde Mongo
        elif isinstance(fecha_raw, datetime):
            fecha = fecha_raw

        # Solo marcar los días del mes actual
        if fecha and fecha.month == mes_actual and fecha.year == anio_actual:
            dias_usados.add(fecha.day)

    # Crear array de 31 días con True/False según si se usó ese día
    dias_mes = [(d in dias_usados) for d in range(1, 32)]

    return {"dias": dias_mes}

@app.get("/weekly_emotions/{user_id}")
async def get_weekly_emotions(user_id: str):
    try:
        doc = await emociones_collection.find_one({"User_id": user_id})
        if not doc or "Emociones" not in doc:
            return JSONResponse(status_code=404, content={"error": "No se encontraron emociones"})

        today = datetime.now()
        week_dates_str = [(today - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(6, -1, -1)]
        
        # 1. Agrupar todas las emociones dominantes por fecha
        emotions_by_date = {}
        for entry in doc.get("Emociones", []):
            fecha = entry.get("fecha")
            emocion = entry.get("emocion_dominante")
            if fecha and emocion and fecha in week_dates_str:
                if fecha not in emotions_by_date:
                    emotions_by_date[fecha] = []
                emotions_by_date[fecha].append(emocion)
        
        # 2. Calcular la emoción más frecuente para cada día
        dominant_emotion_per_day = {}
        for date, emotions_list in emotions_by_date.items():
            # Counter cuenta las ocurrencias de cada emoción (ej: {'angry': 2, 'neutral': 1})
            # .most_common(1) devuelve el más común en una lista: [('angry', 2)]
            # [0][0] extrae el nombre de la emoción: 'angry'
            most_common_emotion = Counter(emotions_list).most_common(1)[0][0]
            dominant_emotion_per_day[date] = most_common_emotion
            
        # 3. Formatear la respuesta final
        response = []
        for date_str in week_dates_str:
            day_name = (datetime.strptime(date_str, "%Y-%m-%d")).strftime("%a") # %a para "Mon", "Tue", etc.
            emotion = dominant_emotion_per_day.get(date_str, None) # Usa el valor calculado
            response.append({
                "day": day_name,
                "emotion": emotion
            })
            
        return {"weekly_emotions": response}
    
    except Exception as e:
        print(f"Error obteniendo emociones semanales: {e}")
        return JSONResponse(status_code=500, content={"error": "Error interno del servidor"})

@app.post("/geminiprompt")
async def consejo(user_data: dict = Body(...)):
    print("➡️ Petición recibida en /geminiprompt para el usuario:", user_data.get('nombre'))
    
    # PASO 0: Notificar al espejo que el análisis va a comenzar
    await manager.broadcast({"status": "starting_analysis"})

    image_url = user_data.get("image_url")
    if not image_url:
        raise HTTPException(status_code=400, detail={"error": "El perfil de usuario no tiene una 'image_url'."})

    print("🔍 Iniciando verificación de rostro y análisis de emoción...")
    resultado_rostro = verificar_rostro(image_url=image_url)

    if resultado_rostro["error"]:
        print(f"❌ Error en la verificación facial: {resultado_rostro['error']}")
        await manager.broadcast({"status": "error", "data": {"error": resultado_rostro["error"]}})
        raise HTTPException(status_code=500, detail=resultado_rostro["error"])

    if not resultado_rostro["es_misma_persona"]:
        print("❌ El rostro no coincide con el del perfil.")
        msg = {"message": "Rostro no reconocido. Acércate para iniciar."}
        await manager.broadcast({"status": "error", "data": msg})
        raise HTTPException(status_code=403, detail="El rostro no coincide con el perfil de usuario.")
    
    print("✅ Rostro verificado. Emoción detectada:", resultado_rostro["emocion_dominante"])

    # Enriquecemos los datos del usuario con los resultados del rostro.
    # Le pasaremos todo el diccionario 'resultado_rostro' a geminiprompt.
    datos_completos_para_gemini = {
        **user_data,
        **resultado_rostro 
    }

    print("🧠 Llamando a geminiprompt() con los datos enriquecidos...")
    # Ahora geminiprompt recibe los datos y no tiene que volver a calcularlos
    respuesta_gemini = await geminiprompt(datos_completos_para_gemini)
    print(f"✅ Respuesta de geminiprompt: {respuesta_gemini}")
    
    # Guardar el consejo en la base de datos (esta lógica es opcional aquí,
    # ya que ahora se hace dentro de gemini.py, pero la dejamos por si acaso)
    if respuesta_gemini.get("consejo"):
        user_id = user_data.get("id")
        # Aquí podrías guardar el consejo, aunque ya se guarda dentro de gemini.py
        print("💾 El consejo y la emoción ya fueron guardados dentro de geminiprompt.")

    # 7. ENVIAR LA RESPUESTA AL ESPEJO EN EL FORMATO CORRECTO
    mensaje_para_espejo = {
        "status": "analysis_complete",
        "data": respuesta_gemini  # respuesta_gemini es el diccionario con nombre, consejo, etc.
    }
    await manager.broadcast(mensaje_para_espejo)
    
    # 8. Devolver la respuesta al frontend móvil
    return respuesta_gemini

@app.get("/protected-data")
async def get_protected_data(current_user: dict = Depends(get_current_user)):
    """
    Ejemplo de ruta protegida que requiere autenticación
    """
    return {
        "message": f"Hola {current_user.get('nombre')}, esta es información protegida",
        "user_data": {
            "nombre": current_user.get("nombre"),
            "correo": current_user.get("correo"),
            "session_id": current_user.get("session_id")
        }
    }

# Ruta opcional (puede ser accedida con o sin autenticación)
@app.get("/public-data")
async def get_public_data(current_user: dict = Depends(get_current_user_optional)):
    """
    Ejemplo de ruta que puede ser accedida con o sin autenticación
    """
    if current_user:
        return {
            "message": "Información pública",
            "user_authenticated": True,
            "user_name": current_user.get("nombre")
        }
    else:
        return {
            "message": "Información pública",
            "user_authenticated": False
        }

@app.put("/profile/{user_id}")
async def edit_profile_endpoint(user_id:str, data:UpdateUser):
    return await editprofile(user_id,data)

@auth_router.post("/logout")
async def logout_endpoint(
    logout_data: LogoutRequest,
    current_user: dict = Depends(get_current_user),
    request: Request = None
):
    """
    Endpoint para cerrar sesión. Delega la lógica al servicio.
    """
    # Extrae el token del header para pasarlo a la función de lógica
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autorización inválido o ausente"
        )
    access_token = auth_header.split(" ")[1]

    # Llama a la función de lógica con todos los datos recolectados
    return await logout_user_session(logout_data, current_user, access_token)