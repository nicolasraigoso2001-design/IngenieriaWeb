from database.connection import SessionLocal, engine



from database.models import (
    
    Base,
    UsuarioDB,
    TourDB,
    ClienteDB,
    GuiaDB,
    TransporteDB,
    ReservaDB,
    HotelDB,
    TourImagenDB,
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

imagenes_tours = [

    TourImagenDB(
        tour_id=1,
        imagen="/static/images/Monserrate.jpg"
    ),

    TourImagenDB(
        tour_id=1,
        imagen="/static/images/bogota.jpg"
    ),

    TourImagenDB(
        tour_id=1,
        imagen="/static/images/Centro historico.jpg"
    ),

    TourImagenDB(
        tour_id=2,
        imagen="/static/images/Guatape.jpg"
    ),

    TourImagenDB(
        tour_id=2,
        imagen="/static/images/Comuna 13.jpg"
    ),

    TourImagenDB(
        tour_id=2,
        imagen="/static/images/Cafe colombiano.jpg"
    ),

    TourImagenDB(
        tour_id=3,
        imagen="/static/images/Ciudad amurallada.webp"
    ),

    TourImagenDB(
        tour_id=3,
        imagen="/static/images/Cartagena colonial.jpg"
    ),

    TourImagenDB(
        tour_id=4,
        imagen="/static/images/Tayrona.jpg"
    ),

    TourImagenDB(
        tour_id=5,
        imagen="/static/images/Amazonas rio.jpg"
    ),

    TourImagenDB(
        tour_id=5,
        imagen="/static/images/Tatacoa.jpg"
    )
]


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






tours = [

    TourDB(

        nombre="Tour Cartagena Premium",

        ciudad="Cartagena",

        precio=850000,

        descripcion="Disfruta playas, ciudad amurallada y gastronomía.",

        imagen="https://images.unsplash.com/photo-1519046904884-53103b34b206"
    ),

    TourDB(

        nombre="Eje Cafetero Experience",

        ciudad="Pereira",

        precio=640000,

        descripcion="Paisajes cafeteros y fincas tradicionales.",

        imagen="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
    ),

    TourDB(

        nombre="Medellín Cultural",

        ciudad="Medellín",

        precio=520000,

        descripcion="Comuna 13, metro cable y cultura paisa.",

        imagen="https://images.unsplash.com/photo-1544986581-efac024faf62"
    )
]

hoteles = [

    HotelDB(

        nombre="Hotel Caribe Luxury",

        ciudad="Cartagena",

        precio=420000,

        descripcion="Hotel 5 estrellas frente al mar.",

        imagen="https://images.unsplash.com/photo-1566073771259-6a8506099945"
    ),

    HotelDB(

        nombre="Hotel Andes Plaza",

        ciudad="Bogotá",

        precio=310000,

        descripcion="Vista premium y desayuno incluido.",

        imagen="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
    )
]



db.add_all(tours)

db.add_all(hoteles)

db.add_all(clientes)

db.add_all(guias)

db.add_all(transportes)

db.add_all(reservas)

# GUARDAR
db.commit()

db.close()

print("✅ Base de datos creada correctamente")


# GUARDAR
db.commit()

db.close()