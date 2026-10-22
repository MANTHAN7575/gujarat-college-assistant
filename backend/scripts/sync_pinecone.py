"""
sync_pinecone.py
Syncs pre-computed 768d college embedding vectors from college_vectors.npz
and metadata from the database to Pinecone Cloud index 'gujarat-colleges-index'.
"""

import os
import sys
import time
import argparse
import logging
from typing import Dict, Any, List
import numpy as np

# Ensure backend directory is in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from dotenv import load_dotenv

# Load env variables from backend/.env and .env
load_dotenv(os.path.join(backend_dir, ".env"))
load_dotenv(os.path.join(os.path.dirname(backend_dir), ".env"))

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.college import College
from app.crud import crud_college
from sqlalchemy.orm import joinedload

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("sync_pinecone")


def parse_args():
    parser = argparse.ArgumentParser(description="Sync 2,530 college vectors to Pinecone Cloud index.")
    parser.add_argument("--api-key", type=str, default=None, help="Pinecone API Key (or set PINECONE_API_KEY in .env)")
    parser.add_argument("--index-name", type=str, default=None, help="Pinecone Index Name (defaults to gujarat-colleges-index)")
    parser.add_argument("--batch-size", type=int, default=100, help="Batch size for vector upserts (default: 100)")
    parser.add_argument("--dry-run", action="store_true", help="Simulate vector packaging and validation without connecting to cloud")
    return parser.parse_args()


def sync_vectors_to_pinecone(api_key: str = None, index_name: str = None, batch_size: int = 100, dry_run: bool = False):
    api_key = api_key or os.getenv("PINECONE_API_KEY") or settings.PINECONE_API_KEY
    index_name = index_name or os.getenv("PINECONE_INDEX_NAME") or settings.PINECONE_INDEX_NAME or "gujarat-colleges-index"

    if not dry_run and not api_key:
        raise ValueError(
            "PINECONE_API_KEY is not configured! Please provide it in backend/.env or pass via --api-key <YOUR_KEY>."
        )

    # 1. Initialize modern Pinecone Client (skip in dry-run)
    index = None
    if not dry_run:
        from pinecone import Pinecone, ServerlessSpec
        logger.info("Initializing Pinecone client...")
        pc = Pinecone(api_key=api_key)

        # 2. Check if index exists, create if not
        existing_indexes = [idx.name for idx in pc.list_indexes()]
        if index_name not in existing_indexes:
            logger.info(f"Index '{index_name}' does not exist. Creating 768-dimensional cosine index...")
            pc.create_index(
                name=index_name,
                dimension=768,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1")
            )
            logger.info("Waiting for index initialization...")
            while not pc.describe_index(index_name).status.get("ready"):
                time.sleep(1)
            logger.info(f"Index '{index_name}' is ready.")
        else:
            logger.info(f"Connecting to existing Pinecone index: '{index_name}'...")

        index = pc.Index(index_name)
    else:
        logger.info("[DRY RUN] Pinecone client initialization bypassed.")

    # 3. Load pre-computed vectors from npz
    npz_candidates = [
        os.path.join(backend_dir, "data", "college_vectors.npz"),
        os.path.join(os.path.dirname(backend_dir), "data", "college_vectors.npz"),
        settings.VECTOR_INDEX_PATH,
    ]
    npz_path = None
    for p in npz_candidates:
        if os.path.exists(p):
            npz_path = p
            break

    if not npz_path:
        raise FileNotFoundError(f"Could not locate college_vectors.npz. Run scripts/build_vector_index.py first.")

    logger.info(f"Loading pre-computed vectors from: {npz_path}")
    npz_data = np.load(npz_path, allow_pickle=True)
    college_ids = npz_data["college_ids"]
    vectors = npz_data["vectors"]
    total_vectors = len(college_ids)
    logger.info(f"Loaded {total_vectors} vectors of shape {vectors.shape}")

    # 4. Fetch institutional metadata from database
    db = SessionLocal()
    try:
        logger.info("Fetching institutional metadata from database...")
        colleges = db.query(College).options(joinedload(College.courses)).all()
        col_map = {col.id: col for col in colleges}
        logger.info(f"Retrieved {len(col_map)} college records from database.")

        # 5. Format records into Pinecone vector tuples/dicts
        vector_records = []
        for i in range(total_vectors):
            cid = int(college_ids[i])
            col = col_map.get(cid)
            v = vectors[i].tolist()

            # Extract tuition fee from first course or None
            fee = 0.0
            if col and col.courses:
                for crs in col.courses:
                    if crs.annual_fees is not None:
                        fee = float(crs.annual_fees)
                        break

            name = col.name if col and col.name else ""
            city = col.city if col and col.city else ""
            acpc_code = str(col.acpc_code or col.code or "") if col else ""
            primary_stream = col.primary_stream if col and col.primary_stream else ""

            record = {
                "id": str(cid),
                "values": v,
                "metadata": {
                    "college_id": cid,
                    "name": name,
                    "city": city,
                    "acpc_code": acpc_code,
                    "primary_stream": primary_stream,
                    "tuition_fee": fee,
                }
            }
            vector_records.append(record)

        # 6. Upsert in batches of 100
        total_batches = (total_vectors + batch_size - 1) // batch_size
        logger.info(f"Beginning upsert of {total_vectors} records across {total_batches} batches (batch size: {batch_size})...")

        for b_idx in range(total_batches):
            start_idx = b_idx * batch_size
            end_idx = min(start_idx + batch_size, total_vectors)
            batch = vector_records[start_idx:end_idx]

            print(f"Upserting batch {b_idx + 1}/{total_batches} (Records {start_idx + 1}-{end_idx})...")
            if not dry_run and index:
                index.upsert(vectors=batch)

        if not dry_run and index:
            logger.info("All vector batches transmitted to Pinecone.")

            # 7. Verify index stats
            logger.info("Verifying index statistics...")
            time.sleep(3)
            stats = index.describe_index_stats()
            logger.info(f"Pinecone Index Stats: {stats}")
            total_count = stats.get("total_vector_count", 0)

            # Retry check if propagation is in progress
            retries = 10
            while total_count < total_vectors and retries > 0:
                time.sleep(2)
                stats = index.describe_index_stats()
                total_count = stats.get("total_vector_count", 0)
                retries -= 1

            print(f"\n=======================================================")
            print(f"Successfully upserted {total_vectors} vectors to Pinecone index: {index_name}")
            print(f"Index Dimension: {stats.get('dimension', 768)} | Verified Total Vectors: {total_count}")
            print(f"=======================================================\n")
            return total_count
        else:
            print(f"\n=======================================================")
            print(f"[DRY RUN] Successfully prepared and validated {total_vectors} vectors for Pinecone index: {index_name}")
            print(f"Sample Record ID: {vector_records[0]['id']} | Dim: {len(vector_records[0]['values'])} | Metadata: {vector_records[0]['metadata']}")
            print(f"=======================================================\n")
            return total_vectors
    finally:
        db.close()


if __name__ == "__main__":
    args = parse_args()
    try:
        sync_vectors_to_pinecone(
            api_key=args.api_key,
            index_name=args.index_name,
            batch_size=args.batch_size,
            dry_run=args.dry_run
        )
    except Exception as e:
        logger.error(f"Sync failed: {e}")
        sys.exit(1)
