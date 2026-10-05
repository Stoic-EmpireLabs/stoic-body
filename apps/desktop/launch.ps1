param([switch]$NoBrowser, [switch]$Stop)
$ErrorActionPreference = 'Stop'
$launchMutex = $null
$hasLock = $false
try {
    $appFolder = $PSScriptRoot
    $runtimePath = Join-Path $appFolder 'runtime\node.exe'
    $serverPath = Join-Path $appFolder 'server.cjs'
    $dataFolder = if ($env:STOIC_BODY_DATA_DIR) { [IO.Path]::GetFullPath($env:STOIC_BODY_DATA_DIR) } else { Join-Path $env:LOCALAPPDATA 'StoicBody' }
    $port = if ($env:STOIC_BODY_PORT) { [int]$env:STOIC_BODY_PORT } else { 4330 }
    if ($port -lt 1 -or $port -gt 65535) { throw 'Choose a local port between 1 and 65535.' }
    $url = "http://127.0.0.1:$port"
    $pidFile = Join-Path $dataFolder "server-$port.json"
    $lockKey = ($dataFolder.ToUpperInvariant() + ':' + $port)
    $sha = [Security.Cryptography.SHA256]::Create()
    try { $lockHash = [BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($lockKey))).Replace('-','') } finally { $sha.Dispose() }
    $launchMutex = New-Object Threading.Mutex($false, "Local\StoicBody-$lockHash")
    try { $hasLock = $launchMutex.WaitOne(30000) } catch [Threading.AbandonedMutexException] { $hasLock = $true }
    if (-not $hasLock) { throw 'Another start or stop is still running. Try again in a moment.' }
    function Get-OwnedProcess {
        if (-not (Test-Path -LiteralPath $pidFile)) { return $null }
        $saved = Get-Content -LiteralPath $pidFile -Raw | ConvertFrom-Json
        $found = Get-CimInstance Win32_Process -Filter "ProcessId = $([int]$saved.id)"
        if ($found -and $found.ExecutablePath -eq $runtimePath -and $found.CommandLine.Contains('"' + $serverPath + '"') -and $found.CreationDate.ToUniversalTime().Ticks.ToString() -eq $saved.created) { return $found }
        return $null
    }
    $owned = Get-OwnedProcess
    if ($Stop) {
        if ($owned) {
            Stop-Process -Id $owned.ProcessId
            Wait-Process -Id $owned.ProcessId -Timeout 10 -ErrorAction SilentlyContinue
            Write-Host 'Stoic Body stopped. Your saved data stays on this computer.'
        } else { Write-Host 'No running server belonging to this download was found.' }
        exit 0
    }
    $listener = Get-NetTCPConnection -LocalAddress '127.0.0.1' -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($listener -and (-not $owned -or $listener.OwningProcess -ne $owned.ProcessId)) { throw "Port $port is already in use. Stop the other Stoic Body download with its Stop launcher before opening this one. No other process was stopped." }
    if (-not $owned) {
        if (-not (Test-Path -LiteralPath $runtimePath) -or -not (Test-Path -LiteralPath $serverPath)) { throw 'Extract the entire ZIP first, then start from the extracted folder.' }
        New-Item -ItemType Directory -Path $dataFolder -Force | Out-Null
        $env:STOIC_BODY_DATA_DIR = $dataFolder
        $env:STOIC_BODY_PORT = $port.ToString()
        $started = Start-Process -FilePath $runtimePath -ArgumentList ('"' + $serverPath + '"') -WorkingDirectory $appFolder -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $dataFolder 'startup.log') -RedirectStandardError (Join-Path $dataFolder 'startup-error.log')
        $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $($started.Id)"
        if (-not $processInfo) { throw 'The local service could not start. Check the startup logs in your StoicBody data folder.' }
        $pendingPidFile = "$pidFile.pending"
        @{ id = $started.Id; created = $processInfo.CreationDate.ToUniversalTime().Ticks.ToString() } | ConvertTo-Json | Set-Content -LiteralPath $pendingPidFile -Encoding UTF8
        if (Test-Path -LiteralPath $pidFile) { [IO.File]::Replace($pendingPidFile, $pidFile, "$pidFile.previous") } else { [IO.File]::Move($pendingPidFile, $pidFile) }
    }
    $ready = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        try {
            $identity = Invoke-RestMethod -Uri "$url/api/identity" -TimeoutSec 1
            $running = Get-OwnedProcess
            $activeListener = Get-NetTCPConnection -LocalAddress '127.0.0.1' -LocalPort $port -State Listen -ErrorAction SilentlyContinue
            if ($identity.product -eq 'Stoic Body' -and $running -and $activeListener -and $activeListener.OwningProcess -eq $running.ProcessId) { $ready = $true; break }
        } catch { Start-Sleep -Milliseconds 200 }
    }
    if (-not $ready) { throw 'The local service did not become ready. Check startup-error.log in your StoicBody data folder.' }
    if (-not $NoBrowser) {
        $edgePath = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
        if ($edgePath) {
            # Visible app window is the requested desktop experience; the helper remains hidden.
            $profilePath = Join-Path $dataFolder 'web-profile'
            Start-Process -FilePath $edgePath -ArgumentList @("--app=$url", ('--user-data-dir="' + $profilePath + '"'), '--no-first-run')
        } else { Start-Process $url; Write-Host 'Microsoft Edge was not found. Stoic Body opened in your default browser.' }
    }
    Write-Host "Stoic Body is ready: $url"
    Write-Host "Saved data: $dataFolder"
} catch { Write-Error $_.Exception.Message; exit 1 }
finally { if ($hasLock) { $launchMutex.ReleaseMutex() }; if ($launchMutex) { $launchMutex.Dispose() } }
