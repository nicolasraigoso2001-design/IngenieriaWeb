from database.connection import engine, SessionLocal
from database.models import *

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# USUARIO
admin = UsuarioDB(
    username="admin",
    password="123"
)

# TOURS
tours = [
    TourDB(nombre="Tour Monserrate", ciudad="Bogotá", precio=50),
    TourDB(nombre="Tour Centro Histórico", ciudad="Bogotá", precio=35),
    TourDB(nombre="Tour Cartagena Colonial", ciudad="Cartagena", precio=120),
    TourDB(nombre="Tour Ciudad Amurallada", ciudad="Cartagena", precio=90),
]

# CLIENTES
clientes = [
    ClienteDB(nombre="Nicolas Raigoso", email="nicolas@email.com"),
    ClienteDB(nombre="Laura Gómez", email="laura@email.com"),
]

db.add(admin)

for t in tours:
    db.add(t)

for c in clientes:
    db.add(c)

db.commit()

print("Datos insertados correctamente")