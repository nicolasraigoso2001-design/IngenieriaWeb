from database.connection import SessionLocal, engine


from database.models import HotelDB
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

if not db.query(UsuarioDB).first():

    db.add(admin)

# =========================
# TOURS
# =========================




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

if not db.query(ClienteDB).first():

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

if not db.query(GuiaDB).first():

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

if not db.query(TransporteDB).first():

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

        nombre="Tour Monserrate",

        ciudad="Bogotá",

        precio=50000,

        descripcion="Disfruta la mejor vista panorámica de Bogotá.",

        imagen="/static/images/Monserrate.jpg"
    ),

    TourDB(

        nombre="Tour Guatapé y Piedra del Peñol",

        ciudad="Medellín",

        precio=120000,

        descripcion="Explora Guatapé y sus paisajes únicos.",

        imagen="/static/images/Guatape.jpg"
    ),

    TourDB(

        nombre="Tour Ciudad Amurallada",

        ciudad="Cartagena",

        precio=95000,

        descripcion="Recorre la histórica ciudad amurallada.",

        imagen="/static/images/Ciudad amurallada.webp"
    ),

    TourDB(

        nombre="Tour Parque Tayrona",

        ciudad="Santa Marta",

        precio=140000,

        descripcion="Naturaleza y playas paradisíacas.",

        imagen="/static/images/Tayrona.jpg"
    ),

    TourDB(

        nombre="Tour Eje Cafetero",

        ciudad="Armenia",

        precio=110000,

        descripcion="Vive la experiencia cafetera colombiana.",

        imagen="/static/images/Cafe colombiano.jpg"
    ),

    TourDB(

        nombre="Tour Cartagena Premium",

        ciudad="Cartagena",

        precio=850000,

        descripcion="Disfruta playas, ciudad amurallada y gastronomía.",

        imagen="/static/images/Cartagena colonial.jpg"
    ),

    TourDB(

        nombre="Eje Cafetero Experience",

        ciudad="Pereira",

        precio=640000,

        descripcion="Paisajes cafeteros y fincas tradicionales.",

        imagen="/static/images/Cafe colombiano.jpg"
    ),

    TourDB(

        nombre="Medellín Cultural",

        ciudad="Medellín",

        precio=520000,

        descripcion="Comuna 13, metro cable y cultura paisa.",

        imagen="/static/images/Comuna 13.jpg"
    )
]

hoteles = [

    HotelDB(

        nombre="Hotel Monserrate Premium",

        ciudad="Bogotá",

        precio=320000,

        descripcion="Vista panorámica de Bogotá y desayuno incluido.",

        imagen="/static/images/hotel-bogota.jpg",

        estrellas=5
    ),

    HotelDB(

        nombre="Andes Plaza Suites",

        ciudad="Bogotá",

        precio=270000,

        descripcion="Hotel ejecutivo cerca del centro histórico.",

        imagen="/static/images/hotel-bogota2.jpg",

        estrellas=4
    ),

    HotelDB(

        nombre="Hotel Medellín Urban",

        ciudad="Medellín",

        precio=350000,

        descripcion="Ubicación premium y rooftop con vista.",

        imagen="/static/images/hotel-medellin.jpg",

        estrellas=5
    ),

    HotelDB(

        nombre="Guatapé Lake Resort",

        ciudad="Medellín",

        precio=410000,

        descripcion="Experiencia de lujo cerca de Guatapé.",

        imagen="/static/images/hotel-medellin2.jpg",

        estrellas=5
    ),

    HotelDB(

        nombre="Hotel Caribe Luxury",

        ciudad="Cartagena",

        precio=420000,

        descripcion="Hotel frente al mar y ciudad amurallada.",

        imagen="/static/images/hotel-cartagena.jpg",

        estrellas=5
    ),

    HotelDB(

        nombre="Cartagena Colonial Inn",

        ciudad="Cartagena",

        precio=295000,

        descripcion="Ambiente colonial en el centro histórico.",

        imagen="/static/images/hotel-cartagena2.jpg",

        estrellas=4
    ),

    HotelDB(

        nombre="Tayrona Eco Resort",

        ciudad="Santa Marta",

        precio=390000,

        descripcion="Naturaleza y descanso cerca del Tayrona.",

        imagen="/static/images/hotel-santamarta.jpg",

        estrellas=5
    ),

    HotelDB(

        nombre="Coffee Paradise Hotel",

        ciudad="Armenia",

        precio=280000,

        descripcion="Experiencia cafetera y paisajes únicos.",

        imagen="/static/images/hotel-armenia.jpg",

        estrellas=4
    )
]



# =========================
# IMÁGENES TOURS
# =========================

if not db.query(TourImagenDB).first():

    db.add_all(imagenes_tours)

# =========================
# HOTELES
# =========================

if not db.query(HotelDB).first():

    db.add_all(hoteles)

# =========================
# TOURS
# =========================

if not db.query(TourDB).filter(
    TourDB.nombre == "Tour Cartagena Premium"
).first():

    db.add_all(tours)


db.commit()

db.close()

print("✅ Base de datos creada correctamente")