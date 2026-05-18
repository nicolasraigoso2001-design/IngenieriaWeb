from patterns.strategy.auth_strategy import AuthStrategy

class GoogleAuthStrategy(AuthStrategy):

    def authenticate(self, username, password):

        print("Autenticación Google")

        return {
            "username": username
        }