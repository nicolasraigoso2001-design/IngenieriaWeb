from pathlib import Path

class ImageAdapter:

    def __init__(self):

        self.images = {
            "Bogotá": "/static/images/bogota.jpg",
            "Cartagena": "/static/images/cartagena.jpg",
            "Medellín": "/static/images/medellin.jpg",
            "Santa Marta": "/static/images/santamarta.jpg",
            "Huila": "/static/images/huila.jpg",
            "Armenia": "/static/images/armenia.jpg",
            "Leticia": "/static/images/amazonas.jpg"
        }

    def obtener_imagen_tour(self, ciudad):

        imagen = self.images.get(
            ciudad,
            "/static/images/default.jpg"
        )

        return {
            "imagen": imagen
        }