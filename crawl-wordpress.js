// Crawl WordPress site and save complete HTML
const fs = require('fs');
const path = require('path');

async function crawlWordPress() {
  const outputDir = path.join(__dirname, 'wordpress-crawl');
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log('Fetching WordPress homepage...');
  
  // Fetch the homepage
  const response = await fetch('https://securethevotemd.com/');
  const html = await response.text();
  
  // Save HTML
  fs.writeFileSync(path.join(outputDir, 'index.html'), html, 'utf8');
  console.log('✅ Saved index.html');
  
  // Extract CSS URLs from HTML
  const cssUrls = [...html.matchAll(/<link[^>]+href=["']([^"']+\.css[^"']*)["']/g)]
    .map(m => m[1])
    .filter(url => url.includes('securethevotemd.com') || url.startsWith('/'));
  
  console.log(`Found ${cssUrls.length} CSS files`);
  
  // Download CSS files
  for (const cssUrl of cssUrls) {
    const fullUrl = cssUrl.startsWith('http') ? cssUrl : `https://securethevotemd.com${cssUrl}`;
    try {
      const cssResponse = await fetch(fullUrl);
      const cssContent = await cssResponse.text();
      
      const filename = path.basename(cssUrl.split('?')[0]);
      fs.writeFileSync(path.join(outputDir, filename), cssContent, 'utf8');
      console.log(`✅ Saved ${filename}`);
    } catch (err) {
      console.log(`⚠️ Failed to download ${cssUrl}`);
    }
  }
  
  console.log('✅ Crawl complete!');
}

crawlWordPress().catch(console.error);
