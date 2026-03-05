# watch-and-push.ps1
# Checks every 5 minutes. When no files have changed for 10 minutes,
# stages everything, commits, and pushes to origin/main.

$marker = Join-Path $env:TEMP "safetylens-marker"

# Create / reset the marker file
New-Item -Path $marker -ItemType File -Force | Out-Null

while ($true) {
    $markerTime = (Get-Item $marker).LastWriteTime

    # Count files modified since the marker was last touched (excluding .git)
    $before = @(Get-ChildItem -Path . -Recurse -File |
        Where-Object { $_.FullName -notmatch '[\\\/]\.git[\\\/]' -and $_.LastWriteTime -gt $markerTime }).Count

    # Refresh the marker timestamp
    (Get-Item $marker).LastWriteTime = Get-Date

    # Wait 5 minutes
    Start-Sleep -Seconds 300

    $markerTime = (Get-Item $marker).LastWriteTime
    $after = @(Get-ChildItem -Path . -Recurse -File |
        Where-Object { $_.FullName -notmatch '[\\\/]\.git[\\\/]' -and $_.LastWriteTime -gt $markerTime }).Count

    if ($after -eq 0 -and $before -eq 0) {
        git add -A
        $ts = Get-Date -Format 'yyyy-MM-dd HH:mm'
        git commit -m "auto-push: build progress $ts"
        git push -u origin main
        Write-Host "Pushed at $(Get-Date). Done."

        # Restore normal power settings (minutes)
        Write-Host "Restoring power settings..."
        powercfg /change standby-timeout-ac 30
        powercfg /change monitor-timeout-ac 15
        powercfg /change hibernate-timeout-ac 60
        Write-Host "Sleep: 30min | Screen off: 15min | Hibernate: 60min"

        break
    }
    else {
        Write-Host "Still working... checked at $(Get-Date)"
    }
}
