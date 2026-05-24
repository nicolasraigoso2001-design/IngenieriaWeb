from patterns.strategy.auth_strategy import AuthStrategy

from database.connection import SessionLocal
from database.models import UsuarioDB


class LocalAuthStrategy(AuthStrategy):

    def authenticate(
        self,
        username: str,
        password: str
    ):

        db = SessionLocal()

        user = db.query(UsuarioDB).filter(
            UsuarioDB.username == username,
            UsuarioDB.password == password
        ).first()

        db.close()

        return user