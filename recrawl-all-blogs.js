// Recrawl all blog posts with full WordPress HTML via browser
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const urls = fs.readFileSync(path.join(__dirname, 'all-post-urls.txt'), 'utf8')
  .split('\n').map(u => u.trim()).filter(Boolean);

async function main() {
  console.log(`Recrawling ${urls.length} blog posts...`);
  
  const browser = await chromium.connectOverCDP('http://127.0.0.1:18800');
  const contexts = browser.contexts();
  const context = contexts[0];
  const page = await context.newPage();
  
  let ok = 0, fail = 0, skip = 0;
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const slug = url.replace('https://securethevotemd.com/', '');
    const outPath = path.join(__dirname, 'dist', slug, 'index.html');
    
    try {
      console.log(`[${i+1}/${urls.length}] ${slug}`);
      
      // Navigate
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Get full HTML
      let html = await page.content();
      
      // Check size (should be 100KB+)
      if (html.length < 50000) {
        console.log(`  WARN: Only ${(html.length/1024).toFixed(0)}KB`);
      }
      
      // Localize URLs
      html = html.replace(/https?:\/\/securethevotemd\.com\//g, '/');
      html = html.replace(/https?:\/\/securethevotemd\.com/g, '');
      html = html.replace(/href="\/wp-content\/uploads\//g, 'href="/images/');
      html = html.replace(/src="\/wp-content\/uploads\//g, 'src="/images/');
      
      // Save
      const dir = path.dirname(outPath);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(outPath, html, 'utf8');
      console.log(`  OK ${(html.length/1024).toFixed(0)}KB`);
      ok++;
      
      // Small delay between pages
      await page.waitForTimeout(500);
      
    } catch (e) {
      console.log(`  FAIL ${e.message}`);
      fail++;
    }
  }
  
  await page.close();
  await browser.close();
  
  console.log(`\nDone: ${ok} saved, ${fail} failed, ${skip} skipped`);
}

main();
