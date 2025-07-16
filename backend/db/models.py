# models.py
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
    edad: int
    preferencias: List[str]
    sexo: str
    correo: str
    palabra_de_seguridad: str
    password: str

class LoginInput(BaseModel):
    correo:str
    password:str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: Optional[PyObjectId] = Field(alias="_id")
    
    model_config = {
        "populate_by_name": True,  
        "json_encoders": {ObjectId: str}
    }
    