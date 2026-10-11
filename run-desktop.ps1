<#
.SYNOPSIS
    Stoic Body — Workstation Launcher
.DESCRIPTION
    Launches the Stoic Body application locally in Google Chrome (stoic1712 profile).
#>

Write-Host "===========================================================" -ForegroundColor DarkCyan
Write-Host "  STOIC BODY — WORKSTATION EDITION                         " -ForegroundColor Cyan
Write-Host "  Offline, Ad-Free Gym & Workout Companion                " -ForegroundColor Gray
Write-Host "===========================================================" -ForegroundColor DarkCyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed or not in PATH. Please install Node.js 20+."
    exit 1
}

Write-Host "[1/2] Checking Dependencies..." -ForegroundColor Cyan
if (-not (Test-Path "$ScriptDir\web\node_modules")) {
    Write-Host "Installing web dependencies..." -ForegroundColor Yellow
    npm --prefix web install
}

Write-Host "[2/2] Launching Chrome (stoic1712 Default Profile)..." -ForegroundColor Green
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (Test-Path $chromePath) {
    Start-Process $chromePath -ArgumentList '--profile-directory="Default"', '--app=http://localhost:5173'
} else {
    Start-Process "http://localhost:5173"
}

Write-Host "Starting Vite development server..." -ForegroundColor Yellow
npm --prefix web run dev
