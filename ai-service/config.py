"""Central configuration for the local civic issue detection API."""

from pathlib import Path
import json
import os

from dotenv import load_dotenv

SERVICE_DIR = Path(__file__).resolve().parent
load_dotenv(SERVICE_DIR / ".env")

# Configure this in .env or the process environment. Relative paths are
# resolved from this service directory, so deployment does not depend on CWD.
MODEL_PATH = os.getenv("MODEL_PATH", "weights/best.pt")

# Category-specific minimum confidence for accepting a detected issue. Labels
# not listed here use the overall fallback threshold.
CONFIDENCE_THRESHOLDS: dict[str, float] = {
    "Garbage/Hygiene": 0.60,
    "Pothole": 0.45,
    "Waterlogging": 0.60,
}
CONFIDENCE_THRESHOLD_FALLBACK = 0.434
CONFIDENCE_THRESHOLD = CONFIDENCE_THRESHOLD_FALLBACK

DEPARTMENTS = json.loads(
    (SERVICE_DIR.parent / "shared" / "departments.json").read_text(encoding="utf-8")
)["departments"]

# Lower bound is inclusive; upper bound is exclusive, except for the last band.
# Lower-confidence accepted detections start in the Low band.
PRIORITY_BANDS: tuple[tuple[float, float, str], ...] = (
    (CONFIDENCE_THRESHOLD_FALLBACK, 0.75, "Low"),
    (0.75, 0.90, "Medium"),
    (0.90, 1.00, "High"),
)

# Keys are normalized to lowercase with spaces/hyphens converted to underscores.
CLASS_NAME_MAP: dict[str, str] = {
    "pothole": "Pothole",
    "potholes": "Pothole",
    "garbage_dump": "Garbage/Hygiene",
    "garbage": "Garbage/Hygiene",
    "garbage_hygiene": "Garbage/Hygiene",
    "waste": "Garbage/Hygiene",
    "water_leakage": "Waterlogging",
    "waterlogging": "Waterlogging",
    "water_logging": "Waterlogging",
    "water_leak": "Waterlogging",
}

DEPARTMENT_MAP: dict[str, str] = {
    "Pothole": DEPARTMENTS[0],
    "Garbage/Hygiene": DEPARTMENTS[2],
    "Waterlogging": DEPARTMENTS[1],
}

MASTER_ADMIN_QUEUE = "Master Admin"

MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024  # 10 MiB
ALLOWED_EXTENSIONS: frozenset[str] = frozenset({".jpg", ".jpeg", ".png", ".webp"})
ALLOWED_CONTENT_TYPES: frozenset[str] = frozenset(
    {"image/jpeg", "image/png", "image/webp"}
)

# Keep detections below the routing threshold so low-confidence issues can be
# returned for manual review instead of being discarded by YOLO preprocessing.
YOLO_DETECTION_CONFIDENCE = 0.001
YOLO_MAX_DETECTIONS = 300

CORS_ORIGINS: list[str] = [
    "http://localhost:3000",
    "http://localhost:5173",
]


def resolved_model_path() -> Path:
    """Return MODEL_PATH as an absolute path, relative to the service if needed."""
    path = Path(MODEL_PATH).expanduser()
    if not path.is_absolute():
        path = SERVICE_DIR / path
    return path.resolve()
