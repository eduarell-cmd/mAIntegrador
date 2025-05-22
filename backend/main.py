from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def welcome ():
    return 'Hola papus, primera mierda de back'

@app.get("/login")
def login():
    return 
