from google import genai
from google.genai import types
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)
response = client.models.generate_content(
    model='gemini-2.0-flash-001', contents="""(Imagina que eres un espejo inteligente el cual te va a dar recomendaciones para tener un mejor dia dependiendo de como te vea y de tu estado de animo, no me digas como estoy ni como me siento, solo dime el consejo como si fuera una notificacion muy muy corta de un mensaje como si fueras un amigo, algo así como: "Por qué no vas a ver una pelicula con algun amigo o deberias de ..." obviamente dependiendo de la persona) Dame un consejo corto o que me recomiendas hacer para sentirme mejor (sexo: masculino, edad: 19 años, estado de animo: ({
    "es_misma_persona": true,
    "emociones": {
        "angry": 4.929999828338623,
        "disgust": 0.7400000095367432,
        "fear": 24.600000381469727,
        "happy": 49.09000015258789,
        "sad": 16.90999984741211,
        "surprise": 0.33000001311302185,
        "neutral": 3.4000000953674316
    },
    "error": null,
    "emocion_dominante": "happy"
}), preferencias: (gimnasio, futbol, peliculas, deportes), ubicación: (Chihuahua, Chihuahua, México), hora actual: 10:34 )',"""
)
print(response.text)