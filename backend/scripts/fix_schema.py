import os
import sys
import logging
from sqlalchemy import text

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine, Base
from app.models import college, chat

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fix_schema")


def fix_schema():
    logger.info("Executing database schema migration for chatbot_logs...")
    
    # Method 1: Alter table to add session_id if missing
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE chatbot_logs ADD COLUMN IF NOT EXISTS session_id VARCHAR(255);"))
            conn.commit()
            logger.info("Column 'session_id' added to 'chatbot_logs' successfully.")
        except Exception as e:
            logger.warning(f"Alter table warning: {e}")

    # Method 2: Ensure all SQLAlchemy metadata tables exist
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("All ORM tables verified/created successfully.")
    except Exception as e:
        logger.error(f"Table creation error: {e}")


if __name__ == "__main__":
    fix_schema()
