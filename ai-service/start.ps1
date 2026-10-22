# Start UIIP AI Detection Service
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting UIIP AI Detection Service (FastAPI + YOLOv8)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$pythonExe = Join-Path $scriptDir ".venv\Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
    Write-Host "[.venv not found] Creating virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
    & $pythonExe -m pip install -r requirements.txt
}

Write-Host "Running AI Service on http://localhost:8000..." -ForegroundColor Green
& $pythonExe -m uvicorn main:app --reload --port 8000
