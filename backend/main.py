from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Query
from fastapi.middleware.cors import CORSMiddleware 
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path 


# ------------------- CONFIG -------------------
SECRET_KEY = "supersecret123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI(
    title="Tourism Management API",
    description="API para gestión de tours, clientes, guías, transportes y reservas"
)
app.mount("/static", StaticFiles(directory="static"), name="static")


# Frontend
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

app.mount(
    "/static",
    StaticFiles(directory=BASE_DIR / "static"),
    name="static"
)

@app.get("/", response_class=HTMLResponse)
def home():
    html = (BASE_DIR / "templates" / "index.html").read_text(encoding="utf-8")
    return HTMLResponse(content=html)

# ------------------- MODELOS -------------------
class Tour(BaseModel):
    id: int
    nombre: str
    ciudad: str
    precio: float

class Cliente(BaseModel):
    id: int
    nombre: str
    email: str

class Guia(BaseModel):
    id: int
    nombre: str
    idioma: str

class Transporte(BaseModel):
    id: int
    tipo: str
    capacidad: int
    tour_id: int

class Reserva(BaseModel):
    id: int
    cliente_id: int
    tour_id: int

class Usuario(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


usuarios = [{"username": "admin", "password": "123"}]

tours = [
    {"id": 1, "nombre": "Tour Monserrate", "ciudad": "Bogotá", "precio": 50},
    {"id": 2, "nombre": "Tour Centro Histórico", "ciudad": "Bogotá", "precio": 35},
    {"id": 3, "nombre": "Tour Cartagena Colonial", "ciudad": "Cartagena", "precio": 120},
    {"id": 4, "nombre": "Tour Ciudad Amurallada", "ciudad": "Cartagena", "precio": 90},
    {"id": 5, "nombre": "Tour Guatapé y Piedra del Peñol", "ciudad": "Medellín", "precio": 110},
    {"id": 6, "nombre": "Tour Comuna 13", "ciudad": "Medellín", "precio": 70},
    {"id": 7, "nombre": "Tour Parque Tayrona", "ciudad": "Santa Marta", "precio": 140},
    {"id": 8, "nombre": "Tour Desierto de la Tatacoa", "ciudad": "Huila", "precio": 95},
    {"id": 9, "nombre": "Tour Café Colombiano", "ciudad": "Armenia", "precio": 80},
    {"id": 10, "nombre": "Tour Amazonas", "ciudad": "Leticia", "precio": 200}
]

clientes = [
    {"id": 1, "nombre": "Nicolas Raigoso", "email": "nicolas@email.com"},
    {"id": 2, "nombre": "Laura Gómez", "email": "laura@email.com"},
]

guias = [
    {"id": 1, "nombre": "Carlos Gómez", "idioma": "Español"},
    {"id": 2, "nombre": "Anna Smith", "idioma": "Inglés"},
]

transportes = [
    {"id": 1, "tipo": "Bus", "capacidad": 30, "tour_id": 1},
    {"id": 2, "tipo": "Van", "capacidad": 12, "tour_id": 2},
    {"id": 3, "tipo": "Microbus", "capacidad": 20, "tour_id": 3},
]

reservas = [
    {"id": 1, "cliente_id": 1, "tour_id": 3},
    {"id": 2, "cliente_id": 2, "tour_id": 1},
]

# ------------------- FUNCIONES AUXILIARES -------------------
def authenticate_user(username: str, password: str):
    for user in usuarios:
        if user["username"] == username and user["password"] == password:
            return user
    return False

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = next((u for u in usuarios if u["username"] == username), None)
    if user is None:
        raise credentials_exception
    return user


@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    
    print("LOGIN:", form_data.username, form_data.password)
    print("USUARIOS:", usuarios)

    user = authenticate_user(form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/tours", dependencies=[Depends(get_current_user)])
def listar_tours():
    return tours

@app.get("/tours/{tour_id}/transportes", dependencies=[Depends(get_current_user)])
def transportes_por_tour(tour_id: int):
    resultado = [t for t in transportes if t["tour_id"] == tour_id]
    return resultado

@app.get("/clientes", dependencies=[Depends(get_current_user)])
def listar_clientes():
    return clientes

@app.get("/guias", dependencies=[Depends(get_current_user)])
def listar_guias():
    return guias

@app.get("/transportes", dependencies=[Depends(get_current_user)])
def listar_transportes():
    return transportes

@app.get("/reservas", dependencies=[Depends(get_current_user)])
def listar_reservas():
    return reservas



# ===============================
# NUEVOS ENDPOINTS (PARCIAL)
# ===============================

# 1. POST → Crear tour (usa tu modelo existente)
@app.post("/tours/create", dependencies=[Depends(get_current_user)])
def crear_tour(tour: Tour):
    tours.append(tour.dict())
    return {"mensaje": "Tour creado", "data": tour}


# 2. GET por ID → con error 404
@app.get("/tours/detail/{id}", dependencies=[Depends(get_current_user)])
def obtener_tour_por_id(id: int):
    for t in tours:
        if t["id"] == id:
            return t
    raise HTTPException(status_code=404, detail="Tour no encontrado")


# 3. GET filtro dinámico (query params)
@app.get("/tours/buscar", dependencies=[Depends(get_current_user)])
def buscar_tours(
    ciudad: Optional[str] = Query(None),
    precio_max: Optional[float] = Query(None)
):
    resultado = tours

    if ciudad:
        resultado = [t for t in resultado if t["ciudad"].lower() == ciudad.lower()]

    if precio_max is not None:
        resultado = [t for t in resultado if t["precio"] <= precio_max]

    return resultado