from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
import json
from deepFace.faceid2 import verificar_rostro
from deepFace.faceid2lap import verificar_rostro as verificar_rostro_lap
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


async def geminiprompt(user_data):
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key)

    hora_actual = datetime.now().strftime("%H:%M")

    datos_emociones = verificar_rostro_lap()

    if datos_emociones["error"]:
        return {
        "consejo": None,
        "emocion": None,
        "error": datos_emociones["error"]
        }

    elif not datos_emociones["es_misma_persona"]:
        return {
        "consejo": None,
        "emocion": None,
        "error": "Rostro no coincide con la persona registrada."
        }
    
    # 2. Guardar la emoción en la base de datos (la lógica de /pruebaemocion)
    user_id = user_data.get("_id") # Obtener el ID del usuario
    if user_id:
        emocion_obj = {
            "fecha": datetime.now().strftime("%Y-%m-%d"),
            "Emociones_Acumuladas": datos_emociones.get("emociones", {}),
            "emocion_dominante": await normalizar_emocion(datos_emociones.get("emocion_dominante")) # Usamos la versión normalizada
        }
        try:
            await emociones_collection.update_one(
                {"User_id": user_id},
                {"$push": {"Emociones": emocion_obj}},
                upsert=True # Crea el documento si no existe
            )
            print(f"✅ Emoción guardada para el usuario {user_id}")
        except Exception as e:
            print(f"❌ Error al guardar emoción para el usuario {user_id}: {e}")
            # No detenemos el flujo, aún podemos dar el consejo
    else:
        print("⚠️ No se encontró user_id, no se guardará la emoción.")

    emociones_limpias = {
        k: float(v) for k, v in datos_emociones["emociones"].items()
    }

    emociones_para_prompt = {
        "es_misma_persona": datos_emociones["es_misma_persona"],
        "emociones": emociones_limpias,
        "error": datos_emociones["error"],
        "emocion_dominante": datos_emociones["emocion_dominante"]
    }
    emociones_json_str = json.dumps(emociones_para_prompt)

    nombre = user_data.get("nombre")
    edad = user_data.get("edad")
    genero = user_data.get("genero")
    descripcion = user_data.get("descripcion")

    prompt_text = f"""(Imagina que eres un espejo inteligente el cual te va a dar recomendaciones para tener un mejor dia dependiendo de como te vea y de tu estado de animo, no me digas como estoy ni como me siento, solo dime el consejo como si fuera una notificacion muy muy corta de un mensaje como si fueras un amigo, algo así como: "Por qué no vas a ver una pelicula con algun amigo o deberias de ..." obviamente dependiendo de la persona) Dame un consejo corto o que me recomiendas hacer para sentirme mejor (genero: {genero}, fecha de nacimiento: {edad}, estado de animo: ({emociones_json_str}), preferencias: {descripcion}, hora actual: {hora_actual} ) En ingles, solo muestra como si fuera la notificación, sin comillas, no me pongas ningun "aqui va" ni "aqui tienes" ni nada, solo el consejo, no me digas como estoy ni como me siento, solo dime el consejo como si fuera una notificacion muy muy corta de un mensaje como si fueras un amigo, algo así como: "Por qué no vas a ver una pelicula con algun amigo o deberias de ..."  pero en ingles, no me digas como estoy ni como me siento, solo dime el consejo como si fuera una notificacion muy muy corta de un mensaje como si fueras un amigo, algo así como: "Por qué no vas a ver una pelicula con algun amigo o deberias de ..." """

    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash-001',
            contents=prompt_text
        )
        return {
            "nombre": nombre,
            "consejo": response.text,
            "emocion": datos_emociones["emocion_dominante"],
            "emocion_foto": datos_emociones["emocion_cruda"],
            "error": None
        }
    except Exception as e:
        print(f"❌ Error llamando a Gemini: {e}")
        return {
            "nombre": nombre,
            "consejo": None,
            "emocion": datos_emociones["emocion_dominante"],
            "emocion_foto": None,
            "error": str(e)
        }