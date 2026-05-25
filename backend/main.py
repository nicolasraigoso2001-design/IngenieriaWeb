from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from patterns.singleton.app_config import AppConfig
from pydantic import BaseModel, Field, EmailStr, validator
from jose import JWTError, jwt
from fastapi import Request

from database.connection import engine, Base
Base.metadata.create_all(bind=engine)


from typing import List, Optional
from datetime import datetime, timedelta
from pathlib import Path
from patterns.observer.subject import Subject
from patterns.observer.reservation_observer import (
    EmailNotificationObserver,
    LogObserver
)
from patterns.adapter.image_adapter import ImageAdapter
from patterns.decorator.log_decorator import log_action
from database.connection import SessionLocal
from patterns.strategy.local_auth import LocalAuthStrategy

from database.models import (
    TourDB,
    UsuarioDB,
    GuiaDB,
    TransporteDB,
    ReservaDB,
    ClienteDB
)

# ------------------- CONFIG -------------------
config = AppConfig()

app = FastAPI(
    title=config.API_NAME,
    version=config.VERSION,
    description="API para gestión de tours, clientes, guías, transportes y reservas"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


# ------------------- MODELOS CON VALIDACIONES -------------------

class Tour(BaseModel):
    nombre: str = Field(..., min_length=3, max_length=100, description="Nombre del tour")
    ciudad: str = Field(..., min_length=2, max_length=80, description="Ciudad del destino")
    precio: float = Field(..., gt=0, description="Precio mayor a 0")

class TourUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=3, max_length=100)
    ciudad: Optional[str] = Field(None, min_length=2, max_length=80)
    precio: Optional[float] = Field(None, gt=0)

class Cliente(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., description="Email válido del cliente")

    @validator("email")
    def email_valido(cls, v):
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Email inválido")
        return v.lower()

class ClienteUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[str] = None

    @validator("email")
    def email_valido(cls, v):
        if v and ("@" not in v or "." not in v.split("@")[-1]):
            raise ValueError("Email inválido")
        return v.lower() if v else v

class Guia(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    idioma: str = Field(..., min_length=2, max_length=50)

class GuiaUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, max_length=100)
    idioma: Optional[str] = Field(None, min_length=2, max_length=50)

class Transporte(BaseModel):
    tipo: str = Field(..., min_length=2, max_length=50)
    capacidad: int = Field(..., gt=0, le=500)
    tour_id: int = Field(..., gt=0)

class TransporteUpdate(BaseModel):
    tipo: Optional[str] = Field(None, min_length=2, max_length=50)
    capacidad: Optional[int] = Field(None, gt=0, le=500)
    tour_id: Optional[int] = Field(None, gt=0)

class Reserva(BaseModel):
    cliente_id: int = Field(..., gt=0)
    tour_id: int = Field(..., gt=0)

class Usuario(BaseModel):

    nombres: str

    apellidos: str

    correo: str

    telefono: str | None = None

    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# =========================
# OBSERVER
# =========================

reservation_subject = Subject()
reservation_subject.attach(EmailNotificationObserver())
reservation_subject.attach(LogObserver())

image_adapter = ImageAdapter()


# ------------------- FUNCIONES AUXILIARES -------------------

def authenticate_user(username: str, password: str):

    db = SessionLocal()

    user = db.query(UsuarioDB).filter(
        UsuarioDB.correo == username,
        UsuarioDB.password == password
    ).first()

    db.close()

    return user

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, config.SECRET_KEY, algorithm=config.ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, config.SECRET_KEY, algorithms=[config.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    db = SessionLocal()
    user = db.query(UsuarioDB).filter(UsuarioDB.correo == username).first()
    db.close()

    if user is None:
        raise credentials_exception
    return user


# ------------------- AUTH -------------------


@app.post("/token")

async def login(
    form_data: OAuth2PasswordRequestForm = Depends()
):

    db = SessionLocal()

    user = db.query(
        UsuarioDB
    ).filter(

        UsuarioDB.correo == form_data.username

    ).first()

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Usuario incorrecto"
        )

    if user.password != form_data.password:

        raise HTTPException(
            status_code=401,
            detail="Contraseña incorrecta"
        )

    access_token = create_access_token(

        data={
            "sub": user.correo
        }
    )

    return {

        "access_token": access_token,

        "token_type":"bearer",

        "nombres": user.nombres
    }





@app.get("/perfil", dependencies=[Depends(get_current_user)])
async def ver_perfil(current_user: UsuarioDB = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "rol": "usuario",
        "estado": "activo"
    }
# ------------------- REGISTRO-------------------

@app.post("/register")

async def register_user(user: Usuario):

    db = SessionLocal()

    existing_user = db.query(
        UsuarioDB
    ).filter(

        UsuarioDB.correo == user.correo

    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="El correo ya existe"
        )

    nuevo_usuario = UsuarioDB(

        nombres=user.nombres,

        apellidos=user.apellidos,

        correo=user.correo,

        telefono=user.telefono,

        password=user.password
    )

    db.add(nuevo_usuario)

    db.commit()

    db.refresh(nuevo_usuario)

    db.close()

    return {
        "message":"Usuario registrado"
    }

# ------------------- TOURS -------------------

@app.get("/tours")

async def get_tours():

    db = SessionLocal()

    tours_db = db.query(
        TourDB
    ).all()

    response = []

    for tour in tours_db:

        imagen = image_adapter.obtener_imagen_tour(
            tour.ciudad
        )

        response.append({

            "id": tour.id,

            "nombre": tour.nombre,

            "ciudad": tour.ciudad,

            "precio": tour.precio,

            "descripcion": getattr(
                tour,
                "descripcion",
                "Tour increíble por Colombia"
            ),

            **imagen
        })

    db.close()

    return response
#-----------------



@app.post("/tours/create", dependencies=[Depends(get_current_user)], status_code=201)
@log_action
async def crear_tour(tour: Tour):
    db = SessionLocal()
    nuevo_tour = TourDB(nombre=tour.nombre, ciudad=tour.ciudad, precio=tour.precio)
    db.add(nuevo_tour)
    db.commit()
    db.refresh(nuevo_tour)
    db.close()
    return {"mensaje": "Tour creado", "data": {"id": nuevo_tour.id, "nombre": nuevo_tour.nombre, "ciudad": nuevo_tour.ciudad, "precio": nuevo_tour.precio}}


@app.get("/tours/buscar", dependencies=[Depends(get_current_user)])
@log_action
async def buscar_tours(
    ciudad: Optional[str] = Query(None),
    precio_max: Optional[float] = Query(None)
):
    db = SessionLocal()
    query = db.query(TourDB)
    if ciudad:
        query = query.filter(TourDB.ciudad.ilike(f"%{ciudad}%"))
    if precio_max is not None:
        query = query.filter(TourDB.precio <= precio_max)
    resultado = query.all()
    db.close()
    response = []
    for tour in resultado:
        imagen = image_adapter.obtener_imagen_tour(tour.ciudad)
        response.append({"id": tour.id, "nombre": tour.nombre, "ciudad": tour.ciudad, "precio": tour.precio, **imagen})
    return response


@app.get("/tours/detail/{id}", dependencies=[Depends(get_current_user)])
@log_action
async def obtener_tour_por_id(id: int):
    db = SessionLocal()
    tour = db.query(TourDB).filter(TourDB.id == id).first()
    db.close()
    if not tour:
        raise HTTPException(status_code=404, detail="Tour no encontrado")
    imagen = image_adapter.obtener_imagen_tour(tour.ciudad)
    return {"id": tour.id, "nombre": tour.nombre, "ciudad": tour.ciudad, "precio": tour.precio, **imagen}


@app.put("/tours/{id}", dependencies=[Depends(get_current_user)])
@log_action
async def actualizar_tour(id: int, tour: TourUpdate):
    db = SessionLocal()
    existing = db.query(TourDB).filter(TourDB.id == id).first()
    if not existing:
        db.close()
        raise HTTPException(status_code=404, detail="Tour no encontrado")
    if tour.nombre is not None:
        existing.nombre = tour.nombre
    if tour.ciudad is not None:
        existing.ciudad = tour.ciudad
    if tour.precio is not None:
        existing.precio = tour.precio
    db.commit()
    db.refresh(existing)
    db.close()
    return {"mensaje": "Tour actualizado", "data": {"id": existing.id, "nombre": existing.nombre, "ciudad": existing.ciudad, "precio": existing.precio}}


@app.delete("/tours/{id}", dependencies=[Depends(get_current_user)])
@log_action
async def eliminar_tour(id: int):
    db = SessionLocal()
    tour = db.query(TourDB).filter(TourDB.id == id).first()
    if not tour:
        db.close()
        raise HTTPException(status_code=404, detail="Tour no encontrado")
    db.delete(tour)
    db.commit()
    db.close()
    return {"mensaje": "Tour eliminado"}


# ------------------- CLIENTES -------------------


@app.get("/clientes", dependencies=[Depends(get_current_user)])
@log_action
async def listar_clientes():
    db = SessionLocal()
    resultado = db.query(ClienteDB).all()
    db.close()
    return resultado


@app.post("/clientes", dependencies=[Depends(get_current_user)], status_code=201)
@log_action
async def crear_cliente(cliente: Cliente):
    db = SessionLocal()
    existente = db.query(ClienteDB).filter(ClienteDB.email == cliente.email).first()
    if existente:
        db.close()
        raise HTTPException(status_code=400, detail="Ya existe un cliente con ese email")
    nuevo = ClienteDB(nombre=cliente.nombre, email=cliente.email)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    db.close()
    return {"mensaje": "Cliente creado", "data": {"id": nuevo.id, "nombre": nuevo.nombre, "email": nuevo.email}}


@app.put("/clientes/{id}", dependencies=[Depends(get_current_user)])
@log_action
async def actualizar_cliente(id: int, cliente: ClienteUpdate):
    db = SessionLocal()
    existing = db.query(ClienteDB).filter(ClienteDB.id == id).first()
    if not existing:
        db.close()
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    if cliente.nombre is not None:
        existing.nombre = cliente.nombre
    if cliente.email is not None:
        existing.email = cliente.email
    db.commit()
    db.refresh(existing)
    db.close()
    return {"mensaje": "Cliente actualizado", "data": {"id": existing.id, "nombre": existing.nombre, "email": existing.email}}


@app.delete("/clientes/{id}", dependencies=[Depends(get_current_user)])
@log_action
async def eliminar_cliente(id: int):
    db = SessionLocal()
    cliente = db.query(ClienteDB).filter(ClienteDB.id == id).first()
    if not cliente:
        db.close()
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    db.delete(cliente)
    db.commit()
    db.close()
    return {"mensaje": "Cliente eliminado"}


# ------------------- GUÍAS -------------------

@app.get("/guias", dependencies=[Depends(get_current_user)])
@log_action
async def listar_guias():
    db = SessionLocal()
    resultado = db.query(GuiaDB).all()
    db.close()
    return resultado


@app.post("/guias", dependencies=[Depends(get_current_user)], status_code=201)
@log_action
async def crear_guia(guia: Guia):
    db = SessionLocal()
    nuevo = GuiaDB(nombre=guia.nombre, idioma=guia.idioma)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    db.close()
    return {"mensaje": "Guía creado", "data": {"id": nuevo.id, "nombre": nuevo.nombre, "idioma": nuevo.idioma}}


@app.put("/guias/{id}", dependencies=[Depends(get_current_user)])
@log_action
async def actualizar_guia(id: int, guia: GuiaUpdate):
    db = SessionLocal()
    existing = db.query(GuiaDB).filter(GuiaDB.id == id).first()
    if not existing:
        db.close()
        raise HTTPException(status_code=404, detail="Guía no encontrado")
    if guia.nombre is not None:
        existing.nombre = guia.nombre
    if guia.idioma is not None:
        existing.idioma = guia.idioma
    db.commit()
    db.refresh(existing)
    db.close()
    return {"mensaje": "Guía actualizado", "data": {"id": existing.id, "nombre": existing.nombre}}


@app.delete("/guias/{id}", dependencies=[Depends(get_current_user)])
@log_action
async def eliminar_guia(id: int):
    db = SessionLocal()
    guia = db.query(GuiaDB).filter(GuiaDB.id == id).first()
    if not guia:
        db.close()
        raise HTTPException(status_code=404, detail="Guía no encontrado")
    db.delete(guia)
    db.commit()
    db.close()
    return {"mensaje": "Guía eliminado"}


# ------------------- TRANSPORTES -------------------

@app.get("/transportes", dependencies=[Depends(get_current_user)])
@log_action
async def listar_transportes():
    db = SessionLocal()
    resultado = db.query(TransporteDB).all()
    db.close()
    return resultado


@app.get("/tours/{tour_id}/transportes", dependencies=[Depends(get_current_user)])
@log_action
async def transportes_por_tour(tour_id: int):
    db = SessionLocal()
    resultado = db.query(TransporteDB).filter(TransporteDB.tour_id == tour_id).all()
    db.close()
    return resultado


@app.post("/transportes", dependencies=[Depends(get_current_user)], status_code=201)
@log_action
async def crear_transporte(transporte: Transporte):
    db = SessionLocal()
    tour = db.query(TourDB).filter(TourDB.id == transporte.tour_id).first()
    if not tour:
        db.close()
        raise HTTPException(status_code=404, detail="Tour no encontrado para este transporte")
    nuevo = TransporteDB(tipo=transporte.tipo, capacidad=transporte.capacidad, tour_id=transporte.tour_id)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    db.close()
    return {"mensaje": "Transporte creado", "data": {"id": nuevo.id, "tipo": nuevo.tipo, "capacidad": nuevo.capacidad, "tour_id": nuevo.tour_id}}


@app.put("/transportes/{id}", dependencies=[Depends(get_current_user)])
@log_action
async def actualizar_transporte(id: int, transporte: TransporteUpdate):
    db = SessionLocal()
    existing = db.query(TransporteDB).filter(TransporteDB.id == id).first()
    if not existing:
        db.close()
        raise HTTPException(status_code=404, detail="Transporte no encontrado")
    if transporte.tipo is not None:
        existing.tipo = transporte.tipo
    if transporte.capacidad is not None:
        existing.capacidad = transporte.capacidad
    if transporte.tour_id is not None:
        existing.tour_id = transporte.tour_id
    db.commit()
    db.refresh(existing)
    db.close()
    return {"mensaje": "Transporte actualizado"}


@app.delete("/transportes/{id}", dependencies=[Depends(get_current_user)])
@log_action
async def eliminar_transporte(id: int):
    db = SessionLocal()
    transporte = db.query(TransporteDB).filter(TransporteDB.id == id).first()
    if not transporte:
        db.close()
        raise HTTPException(status_code=404, detail="Transporte no encontrado")
    db.delete(transporte)
    db.commit()
    db.close()
    return {"mensaje": "Transporte eliminado"}


# ------------------- RESERVAS -------------------

@app.get("/reservas", dependencies=[Depends(get_current_user)])
@log_action
async def listar_reservas():
    db = SessionLocal()
    resultado = db.query(ReservaDB).all()
    response = []
    for r in resultado:
        cliente = db.query(ClienteDB).filter(ClienteDB.id == r.cliente_id).first()
        tour = db.query(TourDB).filter(TourDB.id == r.tour_id).first()
        response.append({
            "id": r.id,
            "cliente_id": r.cliente_id,
            "cliente_nombre": cliente.nombre if cliente else "Desconocido",
            "tour_id": r.tour_id,
            "tour_nombre": tour.nombre if tour else "Desconocido",
        })
    db.close()
    return response


@app.post("/reservas", dependencies=[Depends(get_current_user)], status_code=201)
@log_action
async def crear_reserva(reserva: Reserva):
    db = SessionLocal()
    cliente = db.query(ClienteDB).filter(ClienteDB.id == reserva.cliente_id).first()
    if not cliente:
        db.close()
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    tour = db.query(TourDB).filter(TourDB.id == reserva.tour_id).first()
    if not tour:
        db.close()
        raise HTTPException(status_code=404, detail="Tour no encontrado")
    nueva_reserva = ReservaDB(cliente_id=reserva.cliente_id, tour_id=reserva.tour_id)
    db.add(nueva_reserva)
    db.commit()
    db.refresh(nueva_reserva)
    reservation_subject.notify({
        "id": nueva_reserva.id,
        "cliente_id": nueva_reserva.cliente_id,
        "tour_id": nueva_reserva.tour_id
    })
    db.close()
    return {"mensaje": "Reserva creada", "data": {"id": nueva_reserva.id, "cliente_id": nueva_reserva.cliente_id, "tour_id": nueva_reserva.tour_id}}


@app.delete("/reservas/{id}", dependencies=[Depends(get_current_user)])
@log_action
async def cancelar_reserva(id: int):
    db = SessionLocal()
    reserva = db.query(ReservaDB).filter(ReservaDB.id == id).first()
    if not reserva:
        db.close()
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    db.delete(reserva)
    db.commit()
    db.close()
    return {"mensaje": "Reserva cancelada"}


# ------------------- SEED DATA (solo para demo) -------------------

@app.post("/seed", status_code=201)
async def seed_data():
    """Carga datos de ejemplo para demostración"""
    db = SessionLocal()

    # Verificar si ya hay datos
    if db.query(TourDB).count() > 0:
        db.close()
        return {"mensaje": "Ya existen datos"}

    # Usuarios
    usuarios = [
        UsuarioDB(username="admin", password="admin123"),
        UsuarioDB(username="usuario1", password="pass123"),
    ]
    db.add_all(usuarios)

    # Tours Colombia
    tours = [
        TourDB(nombre="Ciudad Amurallada", ciudad="Cartagena", precio=250000),
        TourDB(nombre="Parque del Café", ciudad="Montenegro", precio=180000),
        TourDB(nombre="Ciudad Perdida", ciudad="Santa Marta", precio=750000),
        TourDB(nombre="Caño Cristales", ciudad="La Macarena", precio=900000),
        TourDB(nombre="Desierto de la Tatacoa", ciudad="Villavieja", precio=320000),
        TourDB(nombre="Monserrate", ciudad="Bogotá", precio=85000),
        TourDB(nombre="Finca Cafetera", ciudad="Salento", precio=150000),
        TourDB(nombre="Bahía de Taganga", ciudad="Santa Marta", precio=200000),
    ]
    db.add_all(tours)
    db.commit()

    # Clientes
    clientes = [
        ClienteDB(nombre="María García", email="maria@email.com"),
        ClienteDB(nombre="Juan Pérez", email="juan@email.com"),
        ClienteDB(nombre="Ana López", email="ana@email.com"),
    ]
    db.add_all(clientes)

    # Guías
    guias = [
        GuiaDB(nombre="Carlos Mendoza", idioma="Español/Inglés"),
        GuiaDB(nombre="Lucía Torres", idioma="Español/Francés"),
        GuiaDB(nombre="Roberto Silva", idioma="Español"),
    ]
    db.add_all(guias)
    db.commit()

    # Transportes
    transportes = [
        TransporteDB(tipo="Bus Turístico", capacidad=40, tour_id=1),
        TransporteDB(tipo="Lancha", capacidad=12, tour_id=8),
        TransporteDB(tipo="Jeep Willys", capacidad=8, tour_id=7),
    ]
    db.add_all(transportes)

    # Reservas
    reservas = [
        ReservaDB(cliente_id=1, tour_id=1),
        ReservaDB(cliente_id=2, tour_id=3),
        ReservaDB(cliente_id=3, tour_id=6),
    ]
    db.add_all(reservas)
    db.commit()
    db.close()

    return {"mensaje": "Datos de ejemplo cargados correctamente"}

# HOTELES

@app.get("/hoteles")

def obtener_hoteles():

    db = SessionLocal()

    hoteles = db.query(
        HotelDB
    ).all()

    return hoteles