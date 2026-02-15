// API endpoint to publish a post (generates HTML and commits to GitHub)
const { Pool } = require('pg');
const { requireAuth } = require('./_auth.js');

// Generate post HTML
function generatePostHTML(post) {
  const publishDate = new Date(post.published_at || new Date());
  const dateStr = publishDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name='robots' content='index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' />
  
  <title>${post.seo_title || post.title} - Secure The Vote MD</title>
  <meta name="description" content="${post.seo_description || post.excerpt || ''}" />
  <link rel="canonical" href="/${post.slug}/" />
  
  <meta property="og:locale" content="en_US" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${post.seo_title || post.title}" />
  <meta property="og:description" content="${post.seo_description || post.excerpt || ''}" />
  <meta property="og:url" content="/${post.slug}/" />
  <meta property="og:site_name" content="Secure The Vote MD" />
  <meta property="article:published_time" content="${publishDate.toISOString()}" />
  ${post.og_image ? `<meta property="og:image" content="${post.og_image}" />` : ''}
  
  <meta name="twitter:card" content="summary_large_image" />
  
  <link rel='stylesheet' href='/css/styles.css' />
  <link rel="icon" href="/images/2024/04/cropped-favicon-2-32x32.png" sizes="32x32" />
</head>
<body>
  <div id="app">
    <header class="site-header">
      <div class="container">
        <a href="/"><img src="/images/logo.png" alt="Secure the Vote MD" class="logo"></a>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/blog">Blog</a>
          <a href="/contact">Contact</a>
        </nav>
      </div>
    </header>

    <main class="post-content">
      <article>
        <header class="post-header">
          <h1>${post.title}</h1>
          <div class="post-meta">
            <time datetime="${publishDate.toISOString()}">${dateStr}</time>
            ${post.category ? `<span class="category">${post.category}</span>` : ''}
          </div>
        </header>

        ${post.featured_image ? `<div class="featured-image"><img src="${post.featured_image}" alt="${post.title}"></div>` : ''}

        <div class="post-body">
          ${post.content || ''}
        </div>
      </article>
    </main>

    <footer class="site-footer">
      <div class="container">
        <p>&copy; ${publishDate.getFullYear()} Secure The Vote MD. All rights reserved.</p>
      </div>
    </footer>
  </div>
</body>
</html>`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pool = new Pool({
    connectionString: (process.env.DATABASE_URL || '').trim(),
    ssl: { rejectUnauthorized: false },
    max: 1
  });

  try {
    const admin = requireAuth(req);
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    // Get post
    const postResult = await pool.query(
      'SELECT * FROM posts WHERE id = $1',
      [postId]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = postResult.rows[0];

    // Update post status to published
    const publishDate = new Date();
    await pool.query(
      'UPDATE posts SET status = $1, published_at = $2 WHERE id = $3',
      ['published', publishDate, postId]
    );

    // Generate HTML
    const html = generatePostHTML({ ...post, published_at: publishDate });

    // Create file path (YYYY/MM/DD/slug/)
    const year = publishDate.getFullYear();
    const month = String(publishDate.getMonth() + 1).padStart(2, '0');
    const day = String(publishDate.getDate()).padStart(2, '0');
    const filePath = `dist/${year}/${month}/${day}/${post.slug}/index.html`;

    // Buffer the post HTML as a pending edit (write to site-builder DB which has pending_edits)
    let buffered = false;
    try {
      const siteBuilderPool = new Pool({
        connectionString: process.env.SITE_BUILDER_DATABASE_URL || process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 1
      });
      try {
        await siteBuilderPool.query(
          `INSERT INTO pending_edits (id, site_id, file_path, content, change_description, status, created_at)
           VALUES (gen_random_uuid(), 'securethevotemd', $1, $2, $3, 'pending', NOW())
           ON CONFLICT (site_id, file_path, status) WHERE status = 'pending'
           DO UPDATE SET content = $2, change_description = $3, created_at = NOW()`,
          [filePath, html, `Publish post: ${post.title.substring(0, 60)}`]
        );
        buffered = true;
      } finally {
        await siteBuilderPool.end().catch(() => {});
      }
    } catch (bufferErr) {
      console.error('Failed to buffer post:', bufferErr.message);
    }

    return res.status(200).json({
      success: true,
      message: buffered
        ? 'Post published! Click "Preview Edits" to see it on the staging site.'
        : 'Post published to database. Preview buffering failed.',
      buffered,
      filePath,
      post: { ...post, status: 'published', published_at: publishDate }
    });

  } catch (error) {
    console.error('Publish error:', error);
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await pool.end().catch(() => {});
  }
};
