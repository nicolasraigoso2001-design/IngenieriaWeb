class ExternalImageAPI:

    def get_image(self, city):

        images = {
            "Bogotá": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c",
            "Cartagena": "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc",
            "Medellín": "https://images.unsplash.com/photo-1544735716-392fe2489ffa",
            "Santa Marta": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
        }

        return images.get(
            city,
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
        )