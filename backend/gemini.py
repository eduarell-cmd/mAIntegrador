from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
import json
from deepFace.faceid2 import verificar_rostro
from deepFace.faceid2lap import verificar_rostro as verificar_rostro_lap
from fastapi import HTTPException  
from datetime import datetime

async def geminiprompt():
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

    prompt_text = f"""(Imagina que eres un espejo inteligente el cual te va a dar recomendaciones para tener un mejor dia dependiendo de como te vea y de tu estado de animo, no me digas como estoy ni como me siento, solo dime el consejo como si fuera una notificacion muy muy corta de un mensaje como si fueras un amigo, algo así como: "Por qué no vas a ver una pelicula con algun amigo o deberias de ..." obviamente dependiendo de la persona) Dame un consejo corto o que me recomiendas hacer para sentirme mejor (genero: masculino, edad: 19 años, estado de animo: ({emociones_json_str}), preferencias: (gimnasio, futbol, peliculas, deportes), hora actual: {hora_actual} ) En ingles, solo muestra como si fuera la notificación, no me pongas ningun "aqui va" ni "aqui tienes" ni nada, solo el consejo, no me digas como estoy ni como me siento, solo dime el consejo como si fuera una notificacion muy muy corta de un mensaje como si fueras un amigo, algo así como: "Por qué no vas a ver una pelicula con algun amigo o deberias de ..."  pero en ingles, no me digas como estoy ni como me siento, solo dime el consejo como si fuera una notificacion muy muy corta de un mensaje como si fueras un amigo, algo así como: "Por qué no vas a ver una pelicula con algun amigo o deberias de ..." """

    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash-001',
            contents=prompt_text
        )
        return {
            "consejo": response.text,
            "emocion": datos_emociones["emocion_dominante"],
            "error": None
        }
    except Exception as e:
        print(f"❌ Error llamando a Gemini: {e}")
        return {
            "consejo": None,
            "emocion": datos_emociones["emocion_dominante"],
            "error": str(e)
        }


    return {
    "consejo": response.text,
    "emocion": datos_emociones["emocion_dominante"],
    "error": None
    }