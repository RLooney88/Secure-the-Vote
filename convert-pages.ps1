# Convert WordPress pages to Eleventy markdown files
$pagesJson = Get-Content "../../research/wordpress-migration/securethevotemd/pages.json" -Raw | ConvertFrom-Json
$formsJson = Get-Content "../../research/wordpress-migration/securethevotemd/highlevel-forms.json" -Raw | ConvertFrom-Json

# Create a hash table for form lookups
$formsMap = @{}
foreach ($form in $formsJson) {
    $formsMap[$form.pageSlug] = $form
}

Write-Host "Converting $($pagesJson.Count) pages..." -ForegroundColor Green

$order = 0
foreach ($page in $pagesJson) {
    $slug = $page.slug
    $title = $page.title.rendered
    $content = $page.content.rendered
    $excerpt = $page.excerpt.rendered -replace '<[^>]+>', '' -replace '\s+', ' '
    
    Write-Host "Processing: $title ($slug)" -ForegroundColor Cyan
    
    # Determine if this is the home page
    $isHome = $slug -eq "home" -or $page.id -eq 2
    $permalink = if ($isHome) { "/" } else { "/$slug/" }
    
    # Clean up content - remove Elementor wrapper classes but keep structure
    $content = $content -replace 'data-elementor-[^=]+=("[^"]*"|''[^'']*'')', ''
    $content = $content -replace 'elementor-invisible', ''
    
    # Check if page has a form
    $hasForm = $formsMap.ContainsKey($slug)
    
    # Build frontmatter
    $frontmatter = @"
---
layout: base.njk
title: $title
description: $($excerpt.Trim())
permalink: $permalink
order: $order
---

"@
    
    # Add hero section for pages with forms
    if ($hasForm) {
        $form = $formsMap[$slug]
        $frontmatter += @"
<section class="hero-section">
  <div class="container">
    <h1>$title</h1>
  </div>
</section>

<section class="elementor-section">
  <div class="container">
    <div class="two-column">
      <div class="form-container">
        <h2>$($form.formName)</h2>
        $($form.embedCode)
      </div>
      <div class="content">
        $content
      </div>
    </div>
  </div>
</section>
"@
    } else {
        $frontmatter += @"
<section class="elementor-section">
  <div class="container">
    $content
  </div>
</section>
"@
    }
    
    # Determine filename
    $filename = if ($isHome) { "index.md" } else { "$slug.md" }
    $filepath = "src/pages/$filename"
    
    # Write the file
    Set-Content -Path $filepath -Value $frontmatter -Encoding UTF8
    
    $order++
}

Write-Host "`nConversion complete! Created $($pagesJson.Count) pages." -ForegroundColor Green
Write-Host "Pages location: src/pages/" -ForegroundColor Yellow
