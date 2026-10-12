$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    Write-Error 'Python was not found on PATH. Install Python 3.11+ and try again.'
    exit 1
}

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Error 'Node.js was not found on PATH. Install Node.js and try again.'
    exit 1
}

if (-not (Test-Path "$root\backend\.venv\Scripts\python.exe")) {
    Write-Host 'Creating backend virtual environment...'
    python -m venv "$root\backend\.venv"
}

Write-Host 'Installing backend dependencies...'
& "$root\backend\.venv\Scripts\python.exe" -m pip install --upgrade pip
& "$root\backend\.venv\Scripts\python.exe" -m pip install -r "$root\backend\requirements.txt"

if (-not (Test-Path "$root\frontend\node_modules")) {
    Write-Host 'Installing frontend dependencies...'
    Set-Location "$root\frontend"
    npm install
    Set-Location $root
}

Write-Host 'Starting backend on http://localhost:8000...'
Start-Process powershell -ArgumentList "-NoExit -Command \"Set-Location '$root\backend'; & '$root\backend\.venv\Scripts\python.exe' -m uvicorn app.main:app --host 0.0.0.0 --port 8000\""

Write-Host 'Starting frontend on http://localhost:5173...'
Start-Process powershell -ArgumentList "-NoExit -Command \"Set-Location '$root\frontend'; npm run dev -- --host 0.0.0.0\""

Start-Sleep -Seconds 8
Start-Process "http://localhost:5173"
Write-Host 'Application startup complete.'
