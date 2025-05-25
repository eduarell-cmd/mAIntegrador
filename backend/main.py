from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Habilitar CORS para permitir que el frontend se conecte
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Cambia si React corre en otro puerto
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def welcome ():
    return {"mensaje":"Hola papus, primera mierda de back"}

@app.get("/login")
def login():
    return {"mensaje": "Hola desde el backend papu 😎"}
