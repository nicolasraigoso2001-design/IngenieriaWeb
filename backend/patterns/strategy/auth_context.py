class AuthContext:

    def __init__(self, strategy):
        self.strategy = strategy

    def authenticate(self, username, password):
        return self.strategy.authenticate(
            username,
            password
        )