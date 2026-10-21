"""Ultralytics model loading, image validation, and object inference."""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from threading import Lock

from PIL import Image, UnidentifiedImageError
from ultralytics import YOLO

import config
from schemas import BoundingBox, CanonicalClass, Detection, ImageSize

logger = logging.getLogger(__name__)


class InvalidImageError(ValueError):
    """Raised when uploaded bytes do not decode as a supported image."""


class ModelConfigurationError(RuntimeError):
    """Raised when the configured model cannot be loaded or mapped."""


@dataclass(frozen=True)
class InferenceResult:
    """Detections and source image dimensions returned by the model."""

    detections: list[Detection]
    image_size: ImageSize
    inference_time_ms: float


def _normalize_class_name(name: str) -> str:
    """Normalize model class names for alias lookup."""
    return "_".join(name.strip().lower().replace("-", " ").split())


class YoloService:
    """Loads one YOLO model and runs serialized, thread-safe inference."""

    def __init__(self, model_path: Path | None = None) -> None:
        self.model_path = model_path or config.resolved_model_path()
        if str(config.MODEL_PATH).strip() in {"", "PUT_YOUR_MODEL_PATH_HERE"}:
            raise ModelConfigurationError(
                "Set MODEL_PATH in .env or the process environment to your .pt weights."
            )
        if not self.model_path.is_file():
            raise ModelConfigurationError(
                f"Configured model file does not exist: {self.model_path}"
            )
        if self.model_path.suffix.lower() != ".pt":
            raise ModelConfigurationError(
                f"MODEL_PATH must point to a .pt file: {self.model_path}"
            )

        try:
            self.model = YOLO(str(self.model_path))
        except Exception as exc:
            raise ModelConfigurationError(
                f"Could not load YOLO weights at {self.model_path}: {exc}"
            ) from exc

        raw_names = self.model.names
        if isinstance(raw_names, dict):
            self.class_names = [str(raw_names[key]) for key in sorted(raw_names)]
        else:
            self.class_names = [str(name) for name in raw_names]
        print(f"Loaded model classes: {self.class_names}", flush=True)

        self.class_map: dict[int, CanonicalClass] = {}
        for class_id, raw_name in enumerate(self.class_names):
            canonical = config.CLASS_NAME_MAP.get(_normalize_class_name(raw_name))
            if canonical is None:
                raise ModelConfigurationError(
                    f"Model class {raw_name!r} has no entry in config.CLASS_NAME_MAP."
                )
            self.class_map[class_id] = canonical  # type: ignore[assignment]

        self.model_name = self.model_path.name
        self._inference_lock = Lock()

    def infer(self, image_bytes: bytes) -> InferenceResult:
        """Validate and infer on image bytes, returning mapped detections."""
        try:
            with Image.open(BytesIO(image_bytes)) as source:
                source.load()
                rgb_image = source.convert("RGB")
                width, height = rgb_image.size
        except (UnidentifiedImageError, OSError, ValueError) as exc:
            raise InvalidImageError("Uploaded file is not a valid image.") from exc

        started = time.perf_counter()
        try:
            with self._inference_lock:
                result = self.model.predict(
                    source=rgb_image,
                    conf=config.YOLO_DETECTION_CONFIDENCE,
                    max_det=config.YOLO_MAX_DETECTIONS,
                    verbose=False,
                )[0]
            detections: list[Detection] = []
            if result.boxes is not None:
                for box in result.boxes:
                    class_id = int(box.cls.item())
                    if class_id not in self.class_map:
                        raise RuntimeError(f"Prediction returned unknown class id {class_id}.")
                    confidence = float(box.conf.item())
                    x1, y1, x2, y2 = (float(v) for v in box.xyxy[0].tolist())
                    x1 = min(max(x1, 0.0), float(width))
                    x2 = min(max(x2, 0.0), float(width))
                    y1 = min(max(y1, 0.0), float(height))
                    y2 = min(max(y2, 0.0), float(height))
                    detections.append(
                        Detection(
                            class_name=self.class_map[class_id],
                            confidence=confidence,
                            bbox=BoundingBox(x1=x1, y1=y1, x2=x2, y2=y2),
                            bbox_normalized=BoundingBox(
                                x1=x1 / width,
                                y1=y1 / height,
                                x2=x2 / width,
                                y2=y2 / height,
                            ),
                        )
                    )
        except InvalidImageError:
            raise
        except Exception as exc:
            logger.exception("YOLO inference failed")
            raise RuntimeError(f"YOLO inference failed: {exc}") from exc

        elapsed_ms = (time.perf_counter() - started) * 1000.0
        return InferenceResult(
            detections=detections,
            image_size=ImageSize(width=width, height=height),
            inference_time_ms=elapsed_ms,
        )
