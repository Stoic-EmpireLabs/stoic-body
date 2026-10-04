<#
.SYNOPSIS
    Stoic Body — Workstation Founder Sovereign Edition Launcher
.DESCRIPTION
    Launches Stoic Body locally in permanent Founder Sovereign Mode (100% free,
    zero paywalls, zero external telemetry, native local SQLite persistence).
#>

Write-Host "===========================================================" -ForegroundColor DarkYellow
Write-Host "  STOIC BODY — FOUNDER SOVEREIGN WORKSTATION EDITION       " -ForegroundColor Yellow
Write-Host "  Classical Discipline &bull; Calisthenics &bull; Offline Persistent  " -ForegroundColor Gray
Write-Host "===========================================================" -ForegroundColor DarkYellow

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed or not in PATH. Please install Node.js 20+."
    exit 1
}

Write-Host "[1/3] Verifying Local SQLite Database Engine..." -ForegroundColor Cyan
if (-not (Test-Path "$ScriptDir\data")) {
    New-Item -ItemType Directory -Path "$ScriptDir\data" -Force | Out-Null
}

Write-Host "[2/3] Checking Dependencies..." -ForegroundColor Cyan
if (-not (Test-Path "$ScriptDir\node_modules")) {
    Write-Host "Installing local dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "[3/3] Launching Stoic Body Sovereign Workstation Server..." -ForegroundColor Green
Write-Host "Opening browser at http://localhost:3000 ..." -ForegroundColor Yellow

Start-Process "http://localhost:3000"

npm run dev
