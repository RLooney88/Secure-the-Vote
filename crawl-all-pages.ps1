function Save-PageHTML {
    param([string]$name, [string]$url)
    
    Write-Host "Fetching: $name..."
    
    $html = Invoke-WebRequest -Uri $url -UseBasicParsing
    $content = $html.Content
    
    # Convert URLs
    $content = $content -replace 'https://securethevotemd\.com/', '/' -replace 'http://securethevotemd\.com/', '/'
    
    # Save
    $dir = "dist\$name"
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
    [System.IO.File]::WriteAllText("$PWD\$dir\index.html", $content, [System.Text.Encoding]::UTF8)
    
    $sizeKB = [math]::Round($content.Length/1KB, 1)
    Write-Host "  [DONE] Saved ($sizeKB KB)"
}

Set-Location C:\Users\Roddy\.openclaw\workspace\repos\Secure-the-Vote

# Crawl all 11 pages
@(
    @{name='be-an-election-judge'; url='https://securethevotemd.com/be-an-election-judge/'},
    @{name='board-compliance'; url='https://securethevotemd.com/board-compliance/'},
    @{name='check-voter-registration'; url='https://securethevotemd.com/check-voter-registration/'},
    @{name='in-the-news'; url='https://securethevotemd.com/in-the-news/'},
    @{name='lawsuit-document'; url='https://securethevotemd.com/lawsuit-document/'},
    @{name='maryland-nvra-violations'; url='https://securethevotemd.com/maryland-nvra-violations/'},
    @{name='press-release'; url='https://securethevotemd.com/press-release/'},
    @{name='signature-verification'; url='https://securethevotemd.com/signature-verification/'},
    @{name='sign-the-petition'; url='https://securethevotemd.com/sign-the-petition/'},
    @{name='voter-id'; url='https://securethevotemd.com/voter-id/'},
    @{name='voter-registration-inflation'; url='https://securethevotemd.com/voter-registration-inflation/'}
) | ForEach-Object { Save-PageHTML -name $_.name -url $_.url }

Write-Host ""
Write-Host "[COMPLETE] Crawled and saved 11 pages to dist/"
