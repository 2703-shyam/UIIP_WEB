# Civic Issue Detection API

A local FastAPI service that loads one Ultralytics YOLOv8 `.pt` model at startup, detects civic issues in uploaded images, and returns department and priority suggestions. It does not assign engineers or call external services.

## Configure the model

Set `MODEL_PATH` in `.env` to your weights file. Relative paths are resolved from this directory. For example, this repository currently has a model at `weigths/best.pt` (the directory name is spelled `weigths`):

```dotenv
MODEL_PATH=weigths/best.pt
```

Copy `.env.example` to `.env` for a local setup. The `.env` file is ignored by Git. You can also set `MODEL_PATH` in the process environment; that value takes precedence over `.env`.

The service uses the class names embedded in your model and prints them at startup. It returns the model's raw labels, confidence scores, and bounding boxes. A model can detect only the classes it was trained to recognize; changing the weights does not make it recognize arbitrary objects. The service fails to start if the configured weights file is missing, so it never returns simulated detections.

All service settings are in `config.py`, including the confidence threshold, priority bands, class aliases, department names, upload size/types, and CORS origins.

## Install and run

From this directory, install dependencies and start the service:

```bash
python -m pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The model is loaded once during FastAPI startup. Configure `MODEL_PATH` and ensure that the referenced weights file exists before starting.

## Endpoints

- `GET http://localhost:8000/health` reports model readiness and raw model classes.
- `POST http://localhost:8000/classify` accepts a multipart upload with field name `image`.

Example request:

```bash
curl -X POST -F "image=@test.jpg" http://localhost:8000/classify
```

The service returns only detections that meet their class-specific minimum confidence, with pixel (`bbox`) and normalized (`bbox_normalized`) coordinates. Minimum confidence is 0.60 for Garbage/Hygiene and Waterlogging, 0.45 for Pothole, and 0.434 for other labels. The highest-confidence qualifying detection is used for routing; when none qualify, the response says “No issue found” and returns an empty detections list. The YOLO prediction floor is kept below these thresholds so the service can evaluate confidence before deciding which coordinates to return.

Priority bands use inclusive lower bounds and exclusive upper bounds (the last band includes 1.00): 0.60–<0.75 Low, 0.75–<0.90 Medium, and 0.90–1.00 High. These match the requested bands at two-decimal confidence display.

## Sequence Of Commands that needs to be run Befroe staring teh service on a new device.
cd .\ai-service\ 
py -3.11 -m venv .venv 
.\.venv\Scripts\Activate.ps1 
python -m pip install --upgrade pip 
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000
