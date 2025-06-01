from fastapi import *
from fastapi.datastructures import FormData
from db.models import *
from db.db import personas_collection
from bson import ObjectId
from bson.errors import InvalidId
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from validaciones.validaciones import *

async def get(nombre: str):
    usuario = await personas_collection.find_one({"nombre": nombre})
    if usuario:
        return User(**usuario)
    raise HTTPException(status_code=404, detail="Usuario no encontrado")