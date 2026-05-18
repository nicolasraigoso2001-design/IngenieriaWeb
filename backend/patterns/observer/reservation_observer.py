from patterns.observer.observer import Observer

class EmailNotificationObserver(Observer):

    def update(self, data):

        print(
            f"[EMAIL] Reserva creada correctamente "
            f"para cliente {data['cliente_id']}"
        )


class LogObserver(Observer):

    def update(self, data):

        print(
            f"[LOG] Nueva reserva registrada: {data}"
        )