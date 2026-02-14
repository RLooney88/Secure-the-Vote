$url = 'https://securethevotemd.com/be-an-election-judge/'
$output = 'C:\Users\Roddy\.openclaw\workspace\repos\Secure-the-Vote\dist\be-an-election-judge\index.html'

Write-Host "Fetching: $url"

$headers = @{
    'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    'Accept' = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

try {
    Start-Sleep -Seconds 2
    $response = Invoke-WebRequest -Uri $url -Headers $headers -UseBasicParsing -TimeoutSec 30
    $html = $response.Content
    
    # Convert URLs
    $html = $html -replace 'https://securethevotemd\.com/', '/'
    $html = $html -replace 'http://securethevotemd\.com/', '/'
    
    # Save
    [System.IO.File]::WriteAllText($output, $html, [System.Text.Encoding]::UTF8)
    
    $sizeKB = [math]::Round($html.Length/1KB, 1)
    Write-Host "[SUCCESS] Saved $sizeKB KB to $output"
    
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)"
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
}
