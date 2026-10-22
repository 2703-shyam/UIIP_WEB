"""Rule-based routing and priority suggestions for YOLO detections."""

from __future__ import annotations

import config
from schemas import ClassificationResponse, Detection, ImageSize


def build_classification_response(
    *,
    detections: list[Detection],
    image_size: ImageSize,
    inference_time_ms: float,
    model_name: str,
) -> ClassificationResponse:
    """Choose the highest-confidence detection and apply routing rules."""
    primary = max(detections, key=lambda detection: detection.confidence, default=None)
    threshold = config.CONFIDENCE_THRESHOLD

    if primary is None:
        return ClassificationResponse(
            status="success",
            primary_class=None,
            confidence=None,
            suggested_department=None,
            priority=None,
            needs_manual_review=True,
            routed_to=config.MASTER_ADMIN_QUEUE,
            review_reason="No issue detected",
            detections=detections,
            image_size=image_size,
            threshold_used=threshold,
            model_name=model_name,
            inference_time_ms=inference_time_ms,
        )

    if primary.confidence < threshold:
        return ClassificationResponse(
            status="success",
            primary_class=primary.class_name,
            confidence=primary.confidence,
            suggested_department=None,
            priority=None,
            needs_manual_review=True,
            routed_to=config.MASTER_ADMIN_QUEUE,
            review_reason=f"Low confidence (<{threshold:g})",
            detections=detections,
            image_size=image_size,
            threshold_used=threshold,
            model_name=model_name,
            inference_time_ms=inference_time_ms,
        )

    canonical = config.CLASS_NAME_MAP.get(primary.class_name.strip().lower().replace("-", " ").replace(" ", "_"), primary.class_name)
    department = config.DEPARTMENT_MAP.get(canonical)

    priority = None
    for lower, upper, label in config.PRIORITY_BANDS:
        in_band = lower <= primary.confidence < upper
        is_last_band = upper == 1.0 and primary.confidence <= upper
        if in_band or is_last_band:
            priority = label
            break
    if priority is None:
        raise RuntimeError(
            f"No priority band covers confidence {primary.confidence:.4f}; "
            "check PRIORITY_BANDS in config.py."
        )

    return ClassificationResponse(
        status="success",
        primary_class=primary.class_name,
        confidence=primary.confidence,
        suggested_department=department,
        priority=priority,
        needs_manual_review=False,
        routed_to=department or primary.class_name,
        review_reason=None,
        detections=detections,
        image_size=image_size,
        threshold_used=threshold,
        model_name=model_name,
        inference_time_ms=inference_time_ms,
    )
