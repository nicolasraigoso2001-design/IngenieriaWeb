from fastapi import FastAPI

# 1. Crear la instancia de FastAPI (OBLIGATORIO)
app = FastAPI()

# 2. Endpoint principal
@app.get("/")
def home():
    return {"mensaje": "Mi API está funcionando"}

# 3. Endpoint adicional
@app.get("/eventos")
def listar_eventos():
    return {"eventos": ["CONIITI 2024", "Taller React", "Charla IA"]}