class AppConfig:

    _instance = None

    def __new__(cls):

        if cls._instance is None:

            cls._instance = super(AppConfig, cls).__new__(cls)

            cls._instance.SECRET_KEY = "supersecret123"
            cls._instance.ALGORITHM = "HS256"
            cls._instance.ACCESS_TOKEN_EXPIRE_MINUTES = 30

            cls._instance.API_NAME = "Tourism Management API"
            cls._instance.VERSION = "1.0"

        return cls._instance