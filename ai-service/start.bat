@echo off
echo ========================================================
echo Starting UIIP AI Detection Service (FastAPI + YOLOv8)
echo ========================================================
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
    echo [.venv not found] Creating virtual environment...
    python -m venv .venv
    echo Installing dependencies...
    .\.venv\Scripts\python.exe -m pip install -r requirements.txt
)
echo Running AI service on http://localhost:8000...
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
pause
