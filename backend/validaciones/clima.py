from fastapi import FastAPI
import httpx 
import os
from dotenv import load_dotenv
import requests

async def get_weather():
    url = os.getenv("WEATHER_API_URL")
    headers = {
        "User-Agent": "MiAppClimaChihuahua/1.0"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        data = response.json()

        weather = data["properties"]["timeseries"][1]["data"]
        temp = weather["instant"]["details"]["air_temperature"]
        condition = weather["next_1_hours"]["summary"]["symbol_code"]
        print(temp)
        return {
            "temperature": temp,
            "condition": condition    
        }
