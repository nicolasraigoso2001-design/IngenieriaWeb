from sqlalchemy import Column, Integer, String, Float, ForeignKey
from database.connection import Base


class UsuarioDB(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True)
    password = Column(String)


class TourDB(Base):
    __tablename__ = "tours"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    ciudad = Column(String, nullable=False)
    precio = Column(Float, nullable=False)


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