// Rewrite all WordPress URLs to local paths
const fs = require('fs');
const path = require('path');

console.log('Rewriting WordPress URLs to local paths...');

// Read the HTML
let html = fs.readFileSync('dist/index.html', 'utf8');

// Track changes
let changeCount = 0;

// Rewrite CSS URLs
html = html.replace(/https:\/\/securethevotemd\.com\/wp-content\/plugins\/[^\/]+\/assets\/css\/([^?"']+)/g, (match, filename) => {
  changeCount++;
  return `/css/${path.basename(filename)}`;
});

html = html.replace(/https:\/\/securethevotemd\.com\/wp-content\/themes\/[^\/]+\/assets\/css\/([^?"']+)/g, (match, filename) => {
  changeCount++;
  return `/css/${path.basename(filename)}`;
});

html = html.replace(/https:\/\/securethevotemd\.com\/wp-content\/uploads\/elementor\/css\/([^?"']+)/g, (match, filename) => {
  changeCount++;
  return `/css/${path.basename(filename)}`;
});

// Rewrite image URLs
html = html.replace(/https:\/\/securethevotemd\.com\/wp-content\/uploads\/([^?"']+\.(jpg|jpeg|png|gif|svg|webp))/gi, (match, relativePath) => {
  changeCount++;
  return `/images/${relativePath}`;
});

// Rewrite JS URLs
html = html.replace(/https:\/\/securethevotemd\.com\/wp-content\/plugins\/[^\/]+\/assets\/js\/([^?"']+)/g, (match, filename) => {
  changeCount++;
  return `/js/${path.basename(filename)}`;
});

html = html.replace(/https:\/\/securethevotemd\.com\/wp-includes\/js\/([^?"']+)/g, (match, filename) => {
  changeCount++;
  return `/js/${path.basename(filename)}`;
});

// Rewrite font URLs
html = html.replace(/https:\/\/securethevotemd\.com\/wp-content\/uploads\/elementor\/google-fonts\/css\/([^?"']+)/g, (match, filename) => {
  changeCount++;
  return `/fonts/${path.basename(filename)}`;
});

// Remove WordPress-specific URLs we don't need
html = html.replace(/https:\/\/securethevotemd\.com\/wp-json\/[^"']+/g, '#');
html = html.replace(/https:\/\/securethevotemd\.com\/xmlrpc\.php[^"']*/g, '#');
html = html.replace(/https:\/\/securethevotemd\.com\/\?s=\{search_term_string\}/g, '/search');

// Save the rewritten HTML
fs.writeFileSync('dist/index.html', html, 'utf8');

console.log(`✅ Rewrote ${changeCount} URLs`);
console.log('✅ Saved to dist/index.html');
