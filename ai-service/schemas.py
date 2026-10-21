"""Pydantic response schemas for the detection API."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


CanonicalClass = Literal["Pothole", "Garbage/Hygiene", "Waterlogging"]
Priority = Literal["Low", "Medium", "High"]


class BoundingBox(BaseModel):
    """Coordinates in either source-image pixels or normalized image units."""

    x1: float
    y1: float
    x2: float
    y2: float


class Detection(BaseModel):
    """One YOLO detection mapped to a civic issue class."""

    model_config = ConfigDict(extra="forbid")

    class_name: CanonicalClass
    confidence: float = Field(ge=0.0, le=1.0)
    bbox: BoundingBox
    bbox_normalized: BoundingBox


class ImageSize(BaseModel):
    """Width and height of the uploaded image in pixels."""

    width: int = Field(gt=0)
    height: int = Field(gt=0)


class ClassificationResponse(BaseModel):
    """Classification suggestion and routing information."""

    model_config = ConfigDict(extra="forbid")

    status: Literal["success"]
    primary_class: CanonicalClass | None
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    suggested_department: str | None
    priority: Priority | None
    needs_manual_review: bool
    routed_to: str
    review_reason: str | None
    detections: list[Detection]
    image_size: ImageSize
    threshold_used: float = Field(ge=0.0, le=1.0)
    model_name: str
    inference_time_ms: float = Field(ge=0.0)


class HealthResponse(BaseModel):
    """Model readiness information."""

    status: Literal["ok"]
    model_loaded: bool
    model_name: str
    classes: list[str]


class ErrorResponse(BaseModel):
    """Consistent JSON error body."""

    status: Literal["error"] = "error"
    error: str
