# Download missing WordPress assets from live site

$baseUrl = "https://securethevotemd.com"
$distDir = "dist"

# Create directory structure
New-Item -ItemType Directory -Force -Path "$distDir/wp-content/plugins" | Out-Null
New-Item -ItemType Directory -Force -Path "$distDir/wp-content/themes" | Out-Null
New-Item -ItemType Directory -Force -Path "$distDir/wp-includes" | Out-Null

# List of critical assets from console errors
$assets = @(
    "/wp-content/plugins/embed-pdf-viewer/css/embed-pdf-viewer.css",
    "/wp-content/plugins/elementor/assets/css/frontend.min.css",
    "/wp-content/plugins/elementor/assets/css/widget-heading.min.css",
    "/wp-content/plugins/elementor/assets/css/widget-divider.min.css",
    "/wp-content/plugins/elementor/assets/css/widget-image.min.css",
    "/wp-content/plugins/elementor/assets/css/widget-icon-list.min.css",
    "/wp-content/plugins/elementor/assets/css/widget-social-icons.min.css",
    "/wp-content/plugins/elementor/assets/css/conditionals/e-swiper.min.css",
    "/wp-content/plugins/elementor/assets/css/conditionals/apple-webkit.min.css",
    "/wp-content/plugins/elementor/assets/lib/font-awesome/css/all.min.css",
    "/wp-content/plugins/elementor/assets/lib/font-awesome/css/v4-shims.min.css",
    "/wp-content/plugins/elementor/assets/lib/swiper/v8/css/swiper.min.css",
    "/wp-content/plugins/elementor/assets/lib/animations/styles/fadeIn.min.css",
    "/wp-content/plugins/elementor/assets/lib/animations/styles/fadeInUp.min.css",
    "/wp-content/plugins/elementor/assets/lib/animations/styles/fadeInLeft.min.css",
    "/wp-content/plugins/elementor/assets/lib/animations/styles/fadeInRight.min.css",
    "/wp-content/plugins/elementor/assets/lib/animations/styles/e-animation-float.min.css",
    "/wp-content/plugins/elementor/assets/lib/animations/styles/e-animation-grow.min.css",
    "/wp-content/plugins/elementor/assets/js/frontend.min.js",
    "/wp-content/plugins/elementor/assets/js/frontend-modules.min.js",
    "/wp-content/plugins/elementor/assets/js/webpack.runtime.min.js",
    "/wp-content/plugins/elementor/assets/lib/font-awesome/js/v4-shims.min.js",
    "/wp-content/plugins/elementor/assets/lib/swiper/v8/swiper.min.js",
    "/wp-content/plugins/elementor-pro/assets/css/widget-slides.min.css",
    "/wp-content/plugins/elementor-pro/assets/css/widget-nav-menu.min.css",
    "/wp-content/plugins/elementor-pro/assets/css/conditionals/popup.min.css",
    "/wp-content/plugins/elementor-pro/assets/js/frontend.min.js",
    "/wp-content/plugins/elementor-pro/assets/js/elements-handlers.min.js",
    "/wp-content/plugins/elementor-pro/assets/js/webpack-pro.runtime.min.js",
    "/wp-content/plugins/elementor-pro/assets/lib/smartmenus/jquery.smartmenus.min.js",
    "/wp-content/plugins/contact-form-7/includes/css/styles.css",
    "/wp-content/plugins/contact-form-7/includes/js/index.js",
    "/wp-content/plugins/contact-form-7/includes/swv/js/index.js",
    "/wp-content/plugins/embedpress/assets/css/lazy-load.css",
    "/wp-content/plugins/embedpress/assets/css/blocks.build.css",
    "/wp-content/plugins/embedpress/assets/css/embedpress.css",
    "/wp-content/plugins/embedpress/assets/css/embedpress-elementor.css",
    "/wp-content/plugins/embedpress/assets/js/lazy-load.js",
    "/wp-content/plugins/embedpress/assets/js/gallery-justify.js",
    "/wp-content/plugins/essential-addons-for-elementor-lite/assets/front-end/css/view/general.min.css",
    "/wp-content/plugins/essential-addons-for-elementor-lite/assets/front-end/js/view/general.min.js",
    "/wp-content/plugins/elementskit-lite/widgets/init/assets/css/widget-styles.css",
    "/wp-content/plugins/elementskit-lite/widgets/init/assets/css/responsive.css",
    "/wp-content/plugins/elementskit-lite/widgets/init/assets/js/elementor.js",
    "/wp-content/plugins/elementskit-lite/widgets/init/assets/js/widget-scripts.js",
    "/wp-content/plugins/elementskit-lite/widgets/init/assets/js/animate-circle.min.js",
    "/wp-content/plugins/elementskit-lite/libs/framework/assets/js/frontend-script.js",
    "/wp-content/plugins/elementskit-lite/modules/elementskit-icon-pack/assets/css/ekiticons.css",
    "/wp-content/plugins/google-site-kit/dist/assets/js/googlesitekit-events-provider-contact-form-7-83c32a029ed2cf5b6a82.js",
    "/wp-content/themes/hello-elementor/assets/css/theme.css",
    "/wp-content/themes/hello-elementor/assets/css/header-footer.css",
    "/wp-content/themes/hello-elementor/assets/css/reset.css",
    "/wp-content/themes/hello-elementor/assets/js/hello-frontend.js",
    "/wp-content/themes/hello-theme-child-master/style.css",
    "/wp-includes/js/jquery/jquery.min.js",
    "/wp-includes/js/jquery/jquery-migrate.min.js",
    "/wp-includes/js/jquery/ui/core.min.js",
    "/wp-includes/js/imagesloaded.min.js",
    "/wp-includes/js/dist/i18n.min.js",
    "/wp-includes/js/dist/hooks.min.js",
    "/wp-includes/js/wp-emoji-release.min.js"
)

$count = 0
$failed = 0

foreach ($asset in $assets) {
    $url = "$baseUrl$asset"
    $localPath = Join-Path $distDir $asset.TrimStart('/')
    $dir = Split-Path $localPath -Parent
    
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    
    try {
        Write-Host "Downloading: $asset"
        Invoke-WebRequest -Uri $url -OutFile $localPath -ErrorAction Stop
        $count++
    }
    catch {
        Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`nDownloaded: $count files"
Write-Host "Failed: $failed files" -ForegroundColor $(if ($failed -gt 0) { 'Red' } else { 'Green' })
