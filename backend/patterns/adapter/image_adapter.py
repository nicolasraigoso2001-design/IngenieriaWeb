from patterns.adapter.image_api import ExternalImageAPI

class ImageAdapter:

    def __init__(self):
        self.api = ExternalImageAPI()

    def obtener_imagen_tour(self, ciudad):

        image_url = self.api.get_image(ciudad)

        return {
            "imagen": image_url
        }