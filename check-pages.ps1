$pages = @('be-an-election-judge', 'board-compliance', 'check-voter-registration', 'in-the-news', 'lawsuit-document', 'maryland-nvra-violations', 'press-release', 'signature-verification', 'sign-the-petition', 'voter-id', 'voter-registration-inflation')

Write-Host "Checking crawled pages..."
Write-Host ""

$pages | ForEach-Object {
    $path = "C:\Users\Roddy\.openclaw\workspace\repos\Secure-the-Vote\dist\$_\index.html"
    if (Test-Path $path) {
        $size = (Get-Item $path).Length
        $sizeKB = [math]::Round($size/1KB, 1)
        if ($size -lt 1000) {
            Write-Host "[ERROR] $_ : $sizeKB KB (too small - likely failed)"
        } else {
            Write-Host "[OK] $_ : $sizeKB KB"
        }
    } else {
        Write-Host "[MISSING] $_"
    }
}
