param([string]$InstallRoot = (Join-Path $env:LOCALAPPDATA 'Programs\StoicBody'), [string]$ShortcutDirectory = [Environment]::GetFolderPath('Desktop'), [switch]$NoLaunch)
$ErrorActionPreference = 'Stop'
try {
    function Get-PackageHash([string]$path) {
        $stream = [IO.File]::OpenRead($path)
        $sha = [Security.Cryptography.SHA256]::Create()
        try { return [BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-','').ToLowerInvariant() }
        finally { $stream.Dispose(); $sha.Dispose() }
    }
    $packageRoot = [IO.Path]::GetFullPath($PSScriptRoot)
    $installBase = [IO.Path]::GetFullPath($InstallRoot)
    $manifestPath = Join-Path $packageRoot 'manifest.json'
    $manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
    if ($manifest.sourceCommit -notmatch '^[a-f0-9]{40}$') { throw 'The package manifest has an invalid version.' }
    $manifestHash = Get-PackageHash $manifestPath
    $version = $manifest.sourceCommit.Substring(0,12) + '-' + $manifestHash.Substring(0,12)
    $destination = [IO.Path]::GetFullPath((Join-Path $installBase $version))
    if (-not $destination.StartsWith($installBase.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid install destination.' }
    foreach ($entry in $manifest.files) {
        $source = [IO.Path]::GetFullPath((Join-Path $packageRoot $entry.path))
        $target = [IO.Path]::GetFullPath((Join-Path $destination $entry.path))
        if (-not $source.StartsWith($packageRoot.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase) -or -not $target.StartsWith($destination + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid package path.' }
        if ((Get-PackageHash $source) -ne $entry.sha256) { throw "Package verification failed: $($entry.path)" }
        if (Test-Path -LiteralPath $target) {
            if ((Get-PackageHash $target) -ne $entry.sha256) { throw 'An existing installation differs. It was not overwritten.' }
        } else {
            New-Item -ItemType Directory -Path ([IO.Path]::GetDirectoryName($target)) -Force | Out-Null
            Copy-Item -LiteralPath $source -Destination $target
        }
    }
    if (-not (Test-Path -LiteralPath (Join-Path $destination 'manifest.json'))) { Copy-Item -LiteralPath $manifestPath -Destination (Join-Path $destination 'manifest.json') }
    New-Item -ItemType Directory -Path $ShortcutDirectory -Force | Out-Null
    $shortcutPath = Join-Path $ShortcutDirectory 'Stoic Body.lnk'
    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($shortcutPath)
    if ((Test-Path -LiteralPath $shortcutPath) -and (-not $shortcut.Arguments.Contains($installBase))) { throw 'A different Stoic Body shortcut already exists. It was not replaced.' }
    $shortcut.TargetPath = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
    $shortcut.Arguments = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + (Join-Path $destination 'launch.ps1') + '"'
    $shortcut.WorkingDirectory = $destination
    $shortcut.WindowStyle = 7
    $shortcut.Description = 'Stoic Body - your daily practice, saved on this computer'
    $shortcut.Save()
    Write-Host "Installed and verified: $destination"
    Write-Host "Desktop shortcut: $shortcutPath"
    Write-Host 'Your saved data remains in your LocalAppData\StoicBody folder.'
    if (-not $NoLaunch) { Start-Process -FilePath $shortcut.TargetPath -ArgumentList $shortcut.Arguments -WindowStyle Hidden }
} catch { Write-Error $_.Exception.Message; exit 1 }
