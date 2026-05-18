from patterns.strategy.auth_strategy import AuthStrategy

class MicrosoftAuthStrategy(AuthStrategy):

    def authenticate(self, username, password):

        print("Autenticación Microsoft")

        return {
            "username": username
        }