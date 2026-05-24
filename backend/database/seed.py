from database.connection import SessionLocal, engine
from database.models import (
    Base,
    UsuarioDB,
    TourDB,
    ClienteDB,
    GuiaDB,
    TransporteDB,
    ReservaDB
)

# CREAR TABLAS
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# =========================
# USUARIO ADMIN
# =========================

admin = UsuarioDB(

    nombres="Nicolas",

    apellidos="Raigoso",

    correo="admin@gmail.com",

    telefono="3001234567",

    password="123"
)

db.add(admin)

# =========================
# TOURS
# =========================

tours = [

    TourDB(
        nombre="Tour Monserrate",
        ciudad="Bogotá",
        precio=50000
    ),

    TourDB(
        nombre="Tour Guatapé y Piedra del Peñol",
        ciudad="Medellín",
        precio=120000
    ),

    TourDB(
        nombre="Tour Ciudad Amurallada",
        ciudad="Cartagena",
        precio=95000
    ),

    TourDB(
        nombre="Tour Parque Tayrona",
        ciudad="Santa Marta",
        precio=140000
    ),

    TourDB(
        nombre="Tour Eje Cafetero",
        ciudad="Armenia",
        precio=110000
    )
]

db.add_all(tours)

# =========================
# CLIENTES
# =========================

clientes = [

    ClienteDB(
        nombre="Laura Gómez",
        email="laura@gmail.com"
    ),

    ClienteDB(
        nombre="Carlos Ramírez",
        email="carlos@gmail.com"
    )
]

db.add_all(clientes)

# =========================
# GUIAS
# =========================

guias = [

    GuiaDB(
        nombre="Juan Pérez",
        idioma="Español"
    ),

    GuiaDB(
        nombre="Mariana López",
        idioma="Inglés"
    ),

    GuiaDB(
        nombre="Santiago Torres",
        idioma="Francés"
    )
]

db.add_all(guias)

# =========================
# TRANSPORTES
# =========================

transportes = [

    TransporteDB(
        tipo="Van Turística",
        capacidad=12,
        tour_id=1
    ),

    TransporteDB(
        tipo="Bus Turístico",
        capacidad=40,
        tour_id=2
    ),

    TransporteDB(
        tipo="Microbús",
        capacidad=20,
        tour_id=3
    )
]

db.add_all(transportes)

# =========================
# RESERVAS
# =========================

reservas = [

    ReservaDB(
        cliente_id=1,
        tour_id=1
    ),

    ReservaDB(
        cliente_id=2,
        tour_id=2
    )
]

db.add_all(reservas)

# GUARDAR
db.commit()

db.close()

print("✅ Base de datos creada correctamente")