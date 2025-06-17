import os
from dotenv import load_dotenv
import requests
from datetime import datetime

load_dotenv()  # Carga las variables del .env


def obtener_dia_hora_formateada():
    time_api_url = os.getenv("TIME_API_URL")
    if not time_api_url:
        raise ValueError("La variable TIME_API_URL no está definida en el archivo .env")
    
    res = requests.get(time_api_url)
    res.raise_for_status()  # Para lanzar error si falla la petición
    data = res.json()

    dia = data.get("dayOfWeek", "Desconocido")
    hora = data.get("time", "00:00:00")

    hora12 = datetime.strptime(hora, "%H:%M").strftime("%I:%M %p").lstrip("0").lower()

    return dia, hora12
