from patterns.strategy.auth_strategy import AuthStrategy

class LocalAuthStrategy(AuthStrategy):

    def __init__(self, usuarios):
        self.usuarios = usuarios

    def authenticate(self, username, password):

        for user in self.usuarios:

            if (
                user["username"] == username
                and user["password"] == password
            ):
                return user

        return None