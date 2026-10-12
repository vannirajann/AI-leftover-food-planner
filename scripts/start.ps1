$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$pythonLauncher = Get-Command py -ErrorAction SilentlyContinue
if (-not $pythonLauncher) {
    Write-Error 'The Python Launcher was not found. Install Python 3.12 and try again.'
    exit 1
}

$backendPython = "$root\backend\.venv\Scripts\python.exe"
& $pythonLauncher.Source -3.12 --version
if ($LASTEXITCODE -ne 0) {
    Write-Error 'Python 3.12 is required. Install it from python.org, then run this script again.'
    exit 1
}

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Error 'Node.js was not found on PATH. Install Node.js and try again.'
    exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error 'npm was not found on PATH. Reinstall Node.js with npm enabled and try again.'
    exit 1
}

if (-not (Test-Path $backendPython)) {
    Write-Host 'Creating backend virtual environment...'
    & $pythonLauncher.Source -3.12 -m venv "$root\backend\.venv"
}

Write-Host 'Installing backend dependencies...'
& $backendPython -m pip install --upgrade pip
& $backendPython -m pip install -r "$root\backend\requirements.txt"

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
