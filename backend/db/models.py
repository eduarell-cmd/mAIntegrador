# models.py
from datetime import date
from pydantic import BaseModel, Field
from typing import Optional, List
from bson import ObjectId
from pydantic_core import core_schema
from pydantic import GetCoreSchemaHandler
from typing import Any

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type: Any, handler: GetCoreSchemaHandler) -> core_schema.CoreSchema:
        return core_schema.no_info_plain_validator_function(cls.validate)

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("ID inválido")
        return ObjectId(v)

class UserBase(BaseModel):
    nombre: str
    edad: date
    genero: str
    correo: str
    palabra_de_seguridad: str
    password: str
    descripcion: str 
    image_url: Optional[str] = None
    

class LoginInput(BaseModel):
    correo:str
    password:str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: Optional[str] = Field(alias="_id")
    
    model_config = {
        "populate_by_name": True,  
        "json_encoders": {ObjectId: str}
    }
    