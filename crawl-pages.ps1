# Helper function to convert and save pages
function Save-ConvertedPage {
    param([string]$html, [string]$pageName)
    
    # Convert absolute URLs to relative
    $html = $html -replace 'https://securethevotemd\.com/', '/'
    $html = $html -replace 'http://securethevotemd\.com/', '/'
    
    # Create directory and save
    $path = "dist/$pageName/index.html"
    $dir = Split-Path $path -Parent
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    
    [System.IO.File]::WriteAllText($path, $html, [System.Text.Encoding]::UTF8)
    Write-Host "✓ Saved: $path"
}

# Create temp file for browser results
$tempFile = "$env:TEMP\page-content.txt"

Write-Host "Pages will be saved by browser automation..."
Write-Host "Run this script after browser captures each page."
