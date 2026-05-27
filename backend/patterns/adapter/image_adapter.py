class ImageAdapter:

    def normalizar_ciudad(
        self,
        ciudad
    ):

        return ciudad.lower().strip()

    # 🔥 IMAGEN PRINCIPAL

    def obtener_imagen_tour(
        self,
        ciudad
    ):

        ciudad = self.normalizar_ciudad(
            ciudad
        )

        imagenes = {

            "bogotá":
            "/static/images/Monserrate.jpg",

            "medellín":
            "/static/images/Comuna 13.jpg",

            "cartagena":
            "/static/images/Ciudad amurallada.webp",

            "santa marta":
            "/static/images/Tayrona.jpg",

            "armenia":
            "/static/images/Cafe colombiano.jpg",

            "pereira":
            "/static/images/Cafe colombiano.jpg"
        }

        return {

            "imagen": imagenes.get(
                ciudad,
                "/static/images/bogota.jpg"
            )
        }

    # 🔥 GALERÍA

    def obtener_galeria_tour(
        self,
        ciudad
    ):

        ciudad = self.normalizar_ciudad(
            ciudad
        )

        galerias = {

            "bogotá":[

                "/static/images/Monserrate.jpg",

                "/static/images/Centro historico.jpg",

                "/static/images/bogota.jpg"
            ],

            "medellín":[

                "/static/images/Comuna 13.jpg",

                "/static/images/Guatape.jpg"
            ],

            "cartagena":[

                "/static/images/Ciudad amurallada.webp",

                "/static/images/Cartagena colonial.jpg"
            ],

            "santa marta":[

                "/static/images/Tayrona.jpg"
            ],

            "armenia":[

                "/static/images/Cafe colombiano.jpg"
            ],

            "pereira":[

                "/static/images/Cafe colombiano.jpg"
            ]
        }

        return galerias.get(
            ciudad,
            ["/static/images/bogota.jpg"]
        )