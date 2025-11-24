from sqlalchemy import text
from app.db import engine, Base
from app.models import *  # Import all models to ensure they are registered

print("Dropping all tables via raw SQL...")
with engine.connect() as conn:
    # Order matters less with CASCADE, but good to be thorough
    tables = ["votes", "answers", "questions", "rounds", "players", "games"]
    for table in tables:
        print(f"Dropping {table}...")
        try:
            conn.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE"))
        except Exception as e:
            print(f"Error dropping {table}: {e}")
    conn.commit()

print("Tables dropped.")

print("Creating all tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully.")
