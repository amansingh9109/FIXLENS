import os
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / ".env")
AI_MODEL = os.getenv("AI_MODEL") or os.getenv("GEMINI_MODEL") or "gemma-4-26b-a4b-it"
DATA_DIR = Path(os.getenv("FIXLENS_DATA_DIR", str(ROOT / "backend" / "data")))
MAX_IMAGE_BYTES = 10 * 1024 * 1024
IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
