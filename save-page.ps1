# PowerShell script to save HTML pages
param(
    [Parameter(Mandatory=$true)]
    [string]$PageName,
    
    [Parameter(Mandatory=$true)]
    [string]$HtmlContent
)

$dir = "dist/$PageName"
New-Item -ItemType Directory -Path $dir -Force | Out-Null

$filePath = "$dir/index.html"
[System.IO.File]::WriteAllText((Resolve-Path ".").Path + "\$filePath", $HtmlContent, [System.Text.Encoding]::UTF8)

Write-Host "✓ Saved: $filePath ($([math]::Round($HtmlContent.Length/1KB, 1)) KB)"
