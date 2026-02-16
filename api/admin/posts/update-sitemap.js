// Generate sitemap.xml from published posts and static pages
const { Pool } = require('pg');

// Static pages that should be included in sitemap
const STATIC_PAGES = [
  { path: '/', changefreq: 'weekly', priority: 1.0 },
  { path: '/about/', changefreq: 'monthly', priority: 0.8 },
  { path: '/citizen-action/', changefreq: 'weekly', priority: 0.8 },
  { path: '/contact-us/', changefreq: 'monthly', priority: 0.8 },
  { path: '/sign-the-petition/', changefreq: 'weekly', priority: 0.8 },
  { path: '/be-an-election-judge/', changefreq: 'monthly', priority: 0.8 },
  { path: '/news/', changefreq: 'daily', priority: 0.8 },
  { path: '/our-team/', changefreq: 'monthly', priority: 0.8 },
  { path: '/voter-resources/', changefreq: 'monthly', priority: 0.8 }
];

const BASE_URL = 'https://securethevotemd.com';

// Generate sitemap.xml from posts and static pages
async function generateSitemap() {
  const pool = new Pool({
    connectionString: (process.env.DATABASE_URL || '').trim(),
    ssl: { rejectUnauthorized: false },
    max: 1
  });

  try {
    // Get all published posts
    const result = await pool.query(
      `SELECT id, slug, published_at, updated_at 
       FROM posts 
       WHERE status = 'published' 
       ORDER BY published_at DESC`
    );

    const entries = [];

    // Add static pages
    for (const page of STATIC_PAGES) {
      entries.push({
        loc: `${BASE_URL}${page.path}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: page.changefreq,
        priority: page.priority
      });
    }

    // Add published posts
    for (const post of result.rows) {
      const publishDate = new Date(post.published_at || new Date());
      const year = publishDate.getFullYear();
      const month = String(publishDate.getMonth() + 1).padStart(2, '0');
      const day = String(publishDate.getDate()).padStart(2, '0');

      entries.push({
        loc: `${BASE_URL}/${year}/${month}/${day}/${post.slug}/`,
        lastmod: (post.updated_at || post.published_at).toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: 0.7
      });
    }

    // Generate XML
    const xml = generateSitemapXML(entries);
    return xml;

  } catch (error) {
    console.error('Sitemap generation error:', error);
    throw error;
  } finally {
    await pool.end().catch(() => {});
  }
}

function generateSitemapXML(entries) {
  const urlEntries = entries
    .map(entry => `  <url>
    <loc>${escapeXML(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

function escapeXML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = { generateSitemap, generateSitemapXML };
