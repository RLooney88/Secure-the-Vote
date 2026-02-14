// Crawl all remaining blog posts from WordPress
const fs = require('fs');
const path = require('path');

const urls = fs.readFileSync(path.join(__dirname, 'missing-post-urls.txt'), 'utf8')
  .split('\n').map(u => u.trim()).filter(Boolean);

async function crawl(url) {
  const slug = url.replace('https://securethevotemd.com/', '');
  const outPath = path.join(__dirname, 'dist', slug, 'index.html');
  
  if (fs.existsSync(outPath)) {
    console.log(`SKIP ${slug}`);
    return 'skip';
  }
  
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' }
    });
    if (!res.ok) {
      console.log(`FAIL ${slug} → ${res.status}`);
      return 'fail';
    }
    let html = await res.text();
    
    // Localize URLs
    html = html.replace(/https?:\/\/securethevotemd\.com\//g, '/');
    html = html.replace(/https?:\/\/securethevotemd\.com/g, '');
    html = html.replace(/href="\/wp-content\/uploads\//g, 'href="/images/');
    html = html.replace(/src="\/wp-content\/uploads\//g, 'src="/images/');
    
    const dir = path.dirname(outPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outPath, html, 'utf8');
    console.log(`OK   ${slug} (${(html.length/1024).toFixed(0)}KB)`);
    return 'ok';
  } catch (e) {
    console.log(`ERR  ${slug} → ${e.message}`);
    return 'fail';
  }
}

async function main() {
  console.log(`Crawling ${urls.length} posts...`);
  let ok = 0, fail = 0, skip = 0;
  
  // Process 3 at a time
  for (let i = 0; i < urls.length; i += 3) {
    const batch = urls.slice(i, i + 3);
    const results = await Promise.all(batch.map(crawl));
    for (const r of results) {
      if (r === 'ok') ok++;
      else if (r === 'fail') fail++;
      else skip++;
    }
    // Small delay between batches
    if (i + 3 < urls.length) await new Promise(r => setTimeout(r, 500));
  }
  
  console.log(`\nDone: ${ok} saved, ${fail} failed, ${skip} skipped`);
}

main();
