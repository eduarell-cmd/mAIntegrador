from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
import json
# from deepFace.faceid2 import verificar_rostro
# from deepFace.faceid2lap import verificar_rostro as verificar_rostro_lap
from fastapi import HTTPException  
from datetime import datetime
from db.db import emociones_collection

async def normalizar_emocion(emocion: str) -> str:
    if not emocion:
        return "neutral"

    mapping = {
        "a bit down": "sad",
        "happy": "happy",
        "a bit frustrated": "angry",
        "a little worried": "fear",
        "slightly uncomfortable": "disgust",
        "surprised": "surprise",
        "calm": "neutral"
    }
    return mapping.get(emocion.lower(), "neutral")


async def geminiprompt(datos_completos: dict): 
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    try:
        client = genai.Client(api_key=api_key)
    except Exception as e:
        print(f"Error inicializando el cliente de Gemini: {e}")
        # Devuelve un error si la API key es inválida o falta
        return {"error": "Error de configuración de la API de Gemini."}
    
    hora_actual = datetime.now().strftime("%H:%M")  

    # --- BLOQUE A ELIMINAR ---
    # Ya no necesitamos verificar el rostro aquí. Ya se hizo en main.py.
    # url_del_usuario = user_data.get("image_url")
    # datos_emociones = verificar_rostro_lap(url_del_usuario)
    # ... (todo el bloque if/elif de error y no es la misma persona)
    # --- FIN DEL BLOQUE A ELIMINAR ---
    
    # AHORA, EXTRAEMOS LOS DATOS QUE main.py YA NOS PASÓ
    emocion_dominante_amigable = datos_completos.get("emocion_dominante") # "calm"
    emocion_cruda = datos_completos.get("emocion_cruda") # "neutral"
    porcentajes_emociones = datos_completos.get("emociones", {}) # {"happy": 0.1, ...}

    # El resto de tu lógica para guardar en la BD puede quedar casi igual,
    # pero usando los datos que ya tenemos.
    user_id = datos_completos.get("id") # Obtenemos el id del diccionario completo
    if user_id:
        emocion_obj = {
            "fecha": datetime.now().strftime("%Y-%m-%d"),
            "Emociones_Acumuladas": porcentajes_emociones,
            "emocion_dominante": emocion_cruda # Guardamos la emoción cruda ('neutral')
        }
        try:
            await emociones_collection.update_one(
                {"User_id": user_id},
                {"$push": {"Emociones": emocion_obj}},
                upsert=True
            )
            print(f"✅ Emoción '{emocion_cruda}' guardada para el usuario {user_id}")
        except Exception as e:
            print(f"❌ Error al guardar emoción para el usuario {user_id}: {e}")
    else:
        print("⚠️ No se encontró user_id en 'datos_completos', no se guardará la emoción.")

    # El formateo para el prompt de Gemini se queda igual, usando los datos que extrajimos
    emociones_para_prompt = {
        "es_misma_persona": True, # Ya sabemos que es, si no, no hubiéramos llegado aquí
        "emociones": {k: float(v) for k, v in porcentajes_emociones.items()},
        "error": None,
        "emocion_dominante": emocion_dominante_amigable
    }
    emociones_json_str = json.dumps(emociones_para_prompt)

    nombre = datos_completos.get("nombre")
    edad = datos_completos.get("edad")
    genero = datos_completos.get("genero")
    descripcion = datos_completos.get("descripcion")
    
    # TU PROMPT SE QUEDA EXACTAMENTE IGUAL. NO LO TOCAMOS.
    prompt_text = f"""(Imagina que eres un espejo inteligente el cual te va a dar recomendaciones para tener un mejor dia dependiendo de como te vea y de tu estado de animo, no me digas como estoy ni como me siento, solo dime el consejo como si fuera una notificacion muy muy corta de un mensaje como si fueras un amigo, algo así como: "Por qué no vas a ver una pelicula con algun amigo o deberias de ..." obviamente dependiendo de la persona) Dame un consejo corto o que me recomiendas hacer para sentirme mejor (genero: {genero}, fecha de nacimiento: {edad}, estado de animo: ({emociones_json_str}), preferencias: {descripcion}, hora actual: {hora_actual} ) En ingles, solo muestra como si fuera la notificación, sin comillas, no me pongas ningun "aqui va" ni "aqui tienes" ni nada, solo el consejo, no me digas como estoy ni como me siento, solo dime el consejo como si fuera una notificacion muy muy corta de un mensaje como si fueras un amigo, algo así como: "Por qué no vas a ver una pelicula con algun amigo o deberias de ..."  pero en ingles, no me digas como estoy ni como me siento, solo dime el consejo como si fuera una notificacion muy muy corta de un mensaje como si fueras un amigo, algo así como: "Por qué no vas a ver una pelicula con algun amigo o deberias de ..." """
    try:
        response = client.models.generate_content(
            model='models/gemini-1.5-flash-latest', # Asegúrate que el nombre del modelo sea correcto
            contents=[prompt_text] # El contenido debe ser una lista
        )
        return {
            "nombre": nombre,
            "consejo": response.text,
            "emocion": emocion_dominante_amigable,
            "emocion_foto": emocion_cruda,
            "error": None
        }
    except Exception as e:
        print(f"❌ Error llamando a Gemini: {e}")
        return {
            "nombre": nombre,
            "consejo": "Sorry, I'm feeling a bit disconnected. Let's try again in a moment.",
            "emocion": emocion_dominante_amigable,
            "emocion_foto": emocion_cruda,
            "error": str(e)
        }