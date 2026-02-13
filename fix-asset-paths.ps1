# Fix WordPress asset paths in CSS files for Vercel deployment

$cssFiles = Get-ChildItem -Path "dist/images/elementor/css/*.css" -Recurse
$count = 0

foreach ($file in $cssFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # Replace WordPress URLs with relative paths
    $content = $content -replace 'https://securethevotemd\.com/wp-content/uploads/', '/images/'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $count++
        Write-Host "Fixed: $($file.Name)"
    }
}

Write-Host "`nFixed $count CSS files"
