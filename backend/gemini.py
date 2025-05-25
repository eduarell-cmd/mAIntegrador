from google import genai
from google.genai import types

client = genai.Client(api_key='AIzaSyBPAqwJz9qEFH0oAdVc-PsTly8TvaVhNMI') #API Key Gera
response = client.models.generate_content(
    model='gemini-2.0-flash-001', contents='(Imagina que eres un espejo inteligente el cual te va a dar recomendaciones para tener un mejor dia dependiendo de como te vea y de tu estado de animo, no me digas como estoy ni como me siento, solo dime el consejo como si fuera una notificacion muy muy corta de un mensaje como si fueras un amigo, algo así como: "Por qué no vas a ver una pelicula con algun amigo o deberias de ..." obviamente dependiendo de la persona)Dame un consejo corto o que me recomiendas hacer para sentirme mejor (sexo: masculino, edad: 27 años, estado de animo: feliz, hora actual: 12:22 )',
)
print(response.text)