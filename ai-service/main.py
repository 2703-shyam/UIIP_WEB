"""FastAPI application wiring for local civic issue image detection."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.concurrency import run_in_threadpool

import config
from routing_service import build_classification_response
from schemas import ClassificationResponse, ErrorResponse, HealthResponse
from yolo_service import InvalidImageError, ModelConfigurationError, YoloService

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Load the model once before serving requests; fail startup on bad config."""
    try:
        app.state.yolo_service = YoloService()
    except ModelConfigurationError as exc:
        logger.critical("YOLO service startup failed: %s", exc)
        raise RuntimeError(f"YOLO service startup failed: {exc}") from exc
    yield
    app.state.yolo_service = None


app = FastAPI(
    title="Civic Issue Detection API",
    description="Local YOLOv8 image detection and rule-based routing suggestions.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_error_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Return a small consistent JSON error response."""
    message = str(exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(error=message).model_dump(),
        headers=exc.headers,
    )


@app.get("/health", response_model=HealthResponse)
async def health(request: Request) -> HealthResponse:
    """Report whether the model loaded and which raw classes it exposes."""
    service: YoloService | None = getattr(request.app.state, "yolo_service", None)
    if service is None:
        raise HTTPException(status_code=503, detail="Model is not loaded.")
    return HealthResponse(
        status="ok",
        model_loaded=True,
        model_name=service.model_name,
        classes=service.class_names,
    )


@app.post(
    "/classify",
    response_model=ClassificationResponse,
    responses={400: {"model": ErrorResponse}, 413: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
async def classify(request: Request, image: UploadFile = File(...)) -> ClassificationResponse:
    """Validate one uploaded image and return detection/routing suggestions."""
    suffix = (image.filename or "").rsplit(".", 1)
    extension = f".{suffix[-1].lower()}" if len(suffix) == 2 else ""
    if extension not in config.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image type. Allowed extensions: jpg, jpeg, png, webp.",
        )
    if image.content_type and image.content_type.lower() not in config.ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported content type. Upload a JPEG, PNG, or WEBP image.",
        )

    try:
        content = await image.read(config.MAX_UPLOAD_SIZE_BYTES + 1)
    finally:
        await image.close()
    if len(content) > config.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Image exceeds the {config.MAX_UPLOAD_SIZE_BYTES}-byte upload limit.",
        )
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    service: YoloService | None = getattr(request.app.state, "yolo_service", None)
    if service is None:
        raise HTTPException(status_code=503, detail="Model is not loaded.")

    try:
        result = await run_in_threadpool(service.infer, content)
        return build_classification_response(
            detections=result.detections,
            image_size=result.image_size,
            inference_time_ms=result.inference_time_ms,
            model_name=service.model_name,
        )
    except InvalidImageError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Classification request failed")
        raise HTTPException(status_code=500, detail="Image inference failed.") from exc
