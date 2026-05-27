from sqlalchemy import Column, Integer, String, Float, ForeignKey
from database.connection import Base
from sqlalchemy import ForeignKey

class UsuarioDB(Base):

    __tablename__ = "usuarios"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nombres = Column(
        String,
        nullable=False
    )

    apellidos = Column(
        String,
        nullable=False
    )

    correo = Column(
        String,
        unique=True,
        nullable=False
    )

    telefono = Column(
        String
    )

    password = Column(
        String,
        nullable=False
    )


class ClienteDB(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)


class GuiaDB(Base):
    __tablename__ = "guias"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    idioma = Column(String, nullable=True, default="Español")


class TransporteDB(Base):
    __tablename__ = "transportes"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String, nullable=False)
    capacidad = Column(Integer, nullable=False)
    tour_id = Column(Integer, ForeignKey("tours.id"))


class ReservaDB(Base):
    __tablename__ = "reservas"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"))
    tour_id = Column(Integer, ForeignKey("tours.id"))


class TourDB(Base):

    __tablename__ = "tours"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nombre = Column(String)

    ciudad = Column(String)

    descripcion = Column(String)

    imagen = Column(String)

    precio = Column(Float)

    categoria = Column(String)




class TourImagenDB(Base):

    __tablename__ = "tour_imagenes"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    tour_id = Column(
        Integer,
        ForeignKey("tours.id")
    )

    imagen = Column(String)



class HotelDB(Base):

    __tablename__ = "hoteles"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nombre = Column(String)

    ciudad = Column(String)

    precio = Column(Float)

    descripcion = Column(String)

    imagen = Column(String)

    estrellas = Column(Integer)