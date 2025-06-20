from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
import json
from face_id import verificar_rostro

async def geminiprompt():
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key)

    datos_emociones = verificar_rostro()

    if datos_emociones["error"]:
        print(f"Hubo un error al verificar el rostro o las emociones: {datos_emociones['error']}")
        exit()
    elif not datos_emociones["es_misma_persona"]:
        print("La persona detectada no coincide con la persona conocida. No se generará una recomendación.")
        exit()

    emociones_para_prompt = {
        "es_misma_persona": datos_emociones["es_misma_persona"],
        "emociones": datos_emociones["emociones"],
        "error": datos_emociones["error"],
        "emocion_dominante": datos_emociones["emocion_dominante"]
    }
    emociones_json_str = json.dumps(emociones_para_prompt)

    prompt_text = f"""(Imagina que eres un espejo inteligente el cual te va a dar recomendaciones para tener un mejor dia dependiendo de como te vea y de tu estado de animo, no me digas como estoy ni como me siento, solo dime el consejo como si fuera una notificacion muy muy corta de un mensaje como si fueras un amigo, algo así como: "Por qué no vas a ver una pelicula con algun amigo o deberias de ..." obviamente dependiendo de la persona) Dame un consejo corto o que me recomiendas hacer para sentirme mejor (sexo: masculino, edad: 19 años, estado de animo: ({emociones_json_str}), preferencias: (gimnasio, futbol, peliculas, deportes), ubicación: (Chihuahua, Chihuahua, México), hora actual: 10:34 )"""

    response = client.models.generate_content(
        model='gemini-2.0-flash-001',
        contents=prompt_text
    )

    return response.text