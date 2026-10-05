# Stoic Body: Sovereign OS Offline Launcher
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  Stoic Body: Sovereign Operating System (Offline)" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Starting local production server on http://localhost:3000 ..." -ForegroundColor Green
Start-Process "http://localhost:3000"
npx next start -p 3000
