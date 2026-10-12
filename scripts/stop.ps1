$ErrorActionPreference = 'Stop'

Get-CimInstance Win32_Process | Where-Object { $_.Name -match 'node|python' } | ForEach-Object {
    $process = $_
    if ($process.CommandLine -match 'uvicorn|vite') {
        Stop-Process -Id $process.ProcessId -Force
    }
}

Write-Host 'Stopped demo application processes.'
