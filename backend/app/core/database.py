import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger(__name__)

try:
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )
    # Test connection
    with engine.connect() as conn:
        pass
    logger.info("Successfully connected to PostgreSQL database.")
except Exception as e:
    logger.warning(f"PostgreSQL connection failed ({e}). Falling back to SQLite database.")
    engine = create_engine(
        "sqlite:///./gujarat_colleges.db",
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
