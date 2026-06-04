from backend.database.connection import engine

from sqlalchemy import text

try:

    with engine.connect() as conn:

        conn.execute(
            text(
                """
                ALTER TABLE usuarios
                ADD COLUMN reset_token VARCHAR
                """
            )
        )

        conn.commit()

        print("✅ reset_token agregado")

except Exception as e:

    print("⚠️", e)

try:

    with engine.connect() as conn:

        conn.execute(
            text(
                """
                ALTER TABLE usuarios
                ADD COLUMN reset_token_expiry DATETIME
                """
            )
        )

        conn.commit()

        print("✅ reset_token_expiry agregado")

except Exception as e:

    print("⚠️", e)