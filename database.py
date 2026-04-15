from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SESUAIKAN KREDENSIAL INI:
# Format: postgresql://[username_pgadmin]:[password_pgadmin]@localhost:5432/openclaw_db
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:R4jawal_1@localhost:5432/openclaw_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Fungsi untuk membuka dan menutup koneksi database setiap kali ada request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
