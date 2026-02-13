const fs = require('fs');
const path = require('path');

// Read WordPress pages - strip BOM if present
function readJSONFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Remove BOM if present
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return JSON.parse(content);
}

const pagesData = readJSONFile('./scripts/pages-clean.json');
const formsData = readJSONFile('./scripts/forms-clean.json');

// Create forms map for easy lookup
const formsMap = {};
formsData.forEach(form => {
  formsMap[form.pageSlug] = form;
});

// Extract Elementor styles from data-settings
function extractElementorStyles(html) {
  const styles = {
    backgrounds: [],
    colors: [],
    typography: [],
    spacing: []
  };

  // Extract background settings
  const bgMatches = html.matchAll(/data-settings="([^"]*background[^"]*)"/g);
  for (const match of bgMatches) {
    try {
      const decoded = match[1].replace(/&quot;/g, '"');
      const settings = JSON.parse(decoded);
      if (settings.background_background) {
        styles.backgrounds.push(settings);
      }
    } catch (e) {}
  }

  // Extract inline styles
  const styleMatches = html.matchAll(/style="([^"]*)"/g);
  for (const match of styleMatches) {
    styles.spacing.push(match[1]);
  }

  return styles;
}

// Convert HTML entities
function decodeHTML(html) {
  return html
    .replace(/\\u003c/g, '<')
    .replace(/\\u003e/g, '>')
    .replace(/\\u0026/g, '&')
    .replace(/\\u0027/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n');
}

// Clean Elementor wrapper divs but preserve structure
function cleanElementorHTML(html) {
  let cleaned = decodeHTML(html);
  
  // Remove WordPress wrapping tabs/spaces
  cleaned = cleaned.replace(/^\t+/gm, '');
  
  // Keep Elementor structure classes but make semantic
  cleaned = cleaned.replace(/elementor-section elementor-top-section/g, 'section');
  cleaned = cleaned.replace(/elementor-section /g, 'section ');
  cleaned = cleaned.replace(/elementor-container/g, 'container');
  cleaned = cleaned.replace(/elementor-column-gap-default/g, 'column-gap-default');
  cleaned = cleaned.replace(/elementor-column elementor-col-\d+/g, 'column');
  cleaned = cleaned.replace(/elementor-widget-wrap/g, 'widget-wrap');
  cleaned = cleaned.replace(/elementor-element-populated/g, 'element-populated');
  cleaned = cleaned.replace(/elementor-element /g, 'element ');
  cleaned = cleaned.replace(/elementor-widget elementor-widget-/g, 'widget widget-');
  cleaned = cleaned.replace(/elementor-heading-title/g, 'heading-title');
  cleaned = cleaned.replace(/elementor-size-default/g, 'size-default');
  cleaned = cleaned.replace(/elementor-invisible/g, 'fade-in');
  cleaned = cleaned.replace(/elementor-divider/g, 'divider');
  cleaned = cleaned.replace(/elementor-divider-separator/g, 'divider-separator');
  cleaned = cleaned.replace(/elementor-background-overlay/g, 'background-overlay');
  
  return cleaned;
}

// Generate page files
let createdPages = 0;
let skippedPages = 0;

pagesData.forEach(page => {
  const slug = page.slug;
  const title = page.title.rendered;
  const content = page.content.rendered;
  const description = page.excerpt.rendered.replace(/<[^>]*>/g, '').trim();
  
  // Get form embed if exists
  const form = formsMap[slug];
  
  // Extract and preserve Elementor styling
  const styles = extractElementorStyles(content);
  
  // Clean HTML while preserving structure
  let pageContent = cleanElementorHTML(content);
  
  // Create frontmatter
  const frontmatter = `---
layout: base.njk
title: "${title.replace(/"/g, '\\"')}"
description: "${description.replace(/"/g, '\\"')}"
slug: "${slug}"
order: ${page.menu_order || 999}
date: ${page.date}
${form ? `formId: "${form.formId}"` : ''}
${form ? `formUrl: "${form.url}"` : ''}
${form ? `formName: "${form.formName}"` : ''}
---

${pageContent}
`;

  // Determine output path
  let outputPath;
  if (slug === 'home' || page.slug === 'front-page') {
    outputPath = path.join(__dirname, '../src/index.njk');
  } else {
    outputPath = path.join(__dirname, `../src/pages/${slug}.njk`);
  }

  try {
    fs.writeFileSync(outputPath, frontmatter, 'utf8');
    console.log(`✅ Created: ${slug}`);
    createdPages++;
  } catch (error) {
    console.error(`❌ Failed: ${slug} - ${error.message}`);
    skippedPages++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Created: ${createdPages} pages`);
console.log(`   Skipped: ${skippedPages} pages`);
console.log(`\n✨ Build complete! Run 'npm start' to preview.`);
