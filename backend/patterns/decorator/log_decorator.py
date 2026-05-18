from functools import wraps
from datetime import datetime

def log_action(func):

    @wraps(func)
    async def wrapper(*args, **kwargs):

        print("=" * 50)
        print(f"[LOG] Endpoint ejecutado: {func.__name__}")
        print(f"[LOG] Fecha: {datetime.now()}")
        print("=" * 50)

        return await func(*args, **kwargs)

    return wrapper