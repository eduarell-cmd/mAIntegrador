from fastapi import FastAPI
import httpx 
import os
from dotenv import load_dotenv
import requests

async def get_weather():
    url = os.getenv("WEATHER_API_URL")
    headers = {"User-Agent": "MiAppClimaChihuahua/1.0"}

    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()
        data = resp.json()

    weather = data["properties"]["timeseries"][1]["data"]
    temp = weather["instant"]["details"]["air_temperature"]
    code = weather["next_1_hours"]["summary"]["symbol_code"]

    SYMBOL_TRANSLATIONS = {
        "clearsky_day": "Clear Sky",
        "clearsky_night": "Clear Night Sky",
        "partlycloudy_day": "Partly Cloudy",
        "partlycloudy_night": "Partly Cloudy (night)",
        "fair_day" : "Fair Day",
        "cloudy": "Cloudy",
        "lightrain": "Light Rain",
        "heavyrain": "Heavy Rain",
        "lightsleet": "Light Sleet",
        "heavysleet": "Heavy Sleet",
        "lightssnow": "Light Snow",
        "heavysnow": "Heavy Snow",
        "fog": "Foggy",
        "windy": "Windy",
        "fair_night": "Fair Night",
        "rain": "Rain",
        "sleet": "Sleet",
        "snow": "Snow",
        "rainshowers_day": "Rain Showers",
        "rainshowers_night": "Rain Showers (night)",
        "lightrainshowers_day": "Light Rain Showers",
        "lightrainshowers_night": "Light Rain Showers (night)",
        "heavyrainshowers_day": "Heavy Rain Showers",
        "heavyrainshowers_night": "Heavy Rain Showers (night)"
    }
    condition_text = SYMBOL_TRANSLATIONS.get(code, code)

    return {"temperature": temp, "condition": condition_text}
