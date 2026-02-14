# Inject page-transitions.css into all HTML files
$files = Get-ChildItem -Path "dist" -Recurse -Filter "*.html" -ErrorAction SilentlyContinue
$cssLink = '<link rel="stylesheet" href="/css/page-transitions.css">'

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Skip if already has the CSS link
    if ($content -match "page-transitions\.css") {
        Write-Host "SKIP $($file.FullName.Replace((Get-Location).Path + '\dist\', ''))"
        continue
    }
    
    # Inject after the last <link rel="stylesheet"> in the <head>
    if ($content -match '(<link rel="stylesheet"[^>]*>(?:\s*<link rel="stylesheet"[^>]*>)*)') {
        $lastStylesheet = $Matches[0]
        $newContent = $content -replace [regex]::Escape($lastStylesheet), "$lastStylesheet`n  $cssLink"
        Set-Content $file.FullName -Value $newContent -NoNewline
        Write-Host "OK   $($file.FullName.Replace((Get-Location).Path + '\dist\', ''))"
    } else {
        Write-Host "FAIL $($file.FullName.Replace((Get-Location).Path + '\dist\', '')) - no <link> found"
    }
}
