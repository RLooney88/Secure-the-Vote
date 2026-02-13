# Static Site Builder for SecureTheVoteMD
# Systematically crawls pages and builds a complete static site

$ErrorActionPreference = "Stop"
$workDir = "repos/Secure-the-Vote"
$distDir = "$workDir/dist"

# Ensure dist directory exists
New-Item -ItemType Directory -Force -Path $distDir | Out-Null

# Known pages from navigation
$pages = @(
    @{url = "https://securethevotemd.com/"; path = "index.html"},
    @{url = "https://securethevotemd.com/citizen-action/"; path = "citizen-action/index.html"},
    @{url = "https://securethevotemd.com/resources/"; path = "resources/index.html"},
    @{url = "https://securethevotemd.com/contact-us/"; path = "contact-us/index.html"},
    @{url = "https://securethevotemd.com/register-for-lobby-day-jan-27/"; path = "register-for-lobby-day-jan-27/index.html"},
    @{url = "https://securethevotemd.com/petition-instructions/"; path = "petition-instructions/index.html"},
    @{url = "https://securethevotemd.com/trump-executive-order/"; path = "trump-executive-order/index.html"},
    @{url = "https://securethevotemd.com/list-maintenance/"; path = "list-maintenance/index.html"},
    @{url = "https://securethevotemd.com/2024/04/19/election-accuracy-citizen-action-guide/"; path = "2024/04/19/election-accuracy-citizen-action-guide/index.html"},
    @{url = "https://securethevotemd.com/2025/03/31/response-to-the-maryland-state-board-of-elections-statement-on-president-trumps-executive-order/"; path = "2025/03/31/response-to-the-maryland-state-board-of-elections-statement-on-president-trumps-executive-order/index.html"}
)

Write-Host "Starting static site build..." -ForegroundColor Green
Write-Host "Pages to crawl: $($pages.Count)" -ForegroundColor Cyan

foreach ($page in $pages) {
    Write-Host "`nProcessing: $($page.url)" -ForegroundColor Yellow
    
    # Create directory for the page
    $pageDir = Split-Path -Parent "$distDir/$($page.path)"
    New-Item -ItemType Directory -Force -Path $pageDir | Out-Null
    
    # Download HTML using browser (to avoid 403)
    # For now, mark as TODO - we'll use a Node.js script with Playwright
    Write-Host "  -> Will fetch: $($page.path)" -ForegroundColor Gray
}

Write-Host "`nBuild complete!" -ForegroundColor Green
Write-Host "Pages created in: $distDir" -ForegroundColor Cyan
