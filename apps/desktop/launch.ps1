param([switch]$NoBrowser, [switch]$Stop)
$ErrorActionPreference = 'Stop'
try {
    $appFolder = $PSScriptRoot
    $runtimePath = Join-Path $appFolder 'runtime\node.exe'
    $serverPath = Join-Path $appFolder 'server.cjs'
    $dataFolder = if ($env:STOIC_BODY_DATA_DIR) { [IO.Path]::GetFullPath($env:STOIC_BODY_DATA_DIR) } else { Join-Path $env:LOCALAPPDATA 'StoicBody' }
    $port = if ($env:STOIC_BODY_PORT) { [int]$env:STOIC_BODY_PORT } else { 4330 }
    if ($port -lt 1 -or $port -gt 65535) { throw 'Choose a local port between 1 and 65535.' }
    $url = "http://127.0.0.1:$port"
    $pidFile = Join-Path $dataFolder "server-$port.json"
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
        @{ id = $started.Id; created = $processInfo.CreationDate.ToUniversalTime().Ticks.ToString() } | ConvertTo-Json | Set-Content -LiteralPath $pidFile -Encoding UTF8
    }
    $ready = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        try {
            $identity = Invoke-RestMethod -Uri "$url/api/identity" -TimeoutSec 1
            if ($identity.product -eq 'Stoic Body' -and (Get-OwnedProcess)) { $ready = $true; break }
        } catch { Start-Sleep -Milliseconds 200 }
    }
    if (-not $ready) { throw 'The local service did not become ready. Check startup-error.log in your StoicBody data folder.' }
    if (-not $NoBrowser) { Start-Process $url }
    Write-Host "Stoic Body is ready: $url"
    Write-Host "Saved data: $dataFolder"
} catch { Write-Error $_.Exception.Message; exit 1 }
