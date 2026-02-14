// Extract HTML from already-open browser
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:18800');
  const contexts = browser.contexts();
  const context = contexts[0];
  const pages = context.pages();
  const page = pages.find(p => p.url().includes('be-an-election-judge'));
  
  if (!page) {
    console.log('Page not found. Open pages:', pages.map(p => p.url()));
    await browser.close();
    return;
  }
  
  let html = await page.content();
  
  // Localize URLs
  html = html.replace(/https?:\/\/securethevotemd\.com\//g, '/');
  html = html.replace(/https?:\/\/securethevotemd\.com/g, '');
  html = html.replace(/href="\/wp-content\/uploads\//g, 'href="/images/');
  html = html.replace(/src="\/wp-content\/uploads\//g, 'src="/images/');
  
  const outPath = path.join(__dirname, 'dist/be-an-election-judge/index.html');
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`Saved: ${(html.length/1024).toFixed(1)} KB`);
  
  await browser.close();
})();
