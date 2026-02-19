// API endpoint to preview a post
const { requireAuth } = require('./_auth.js');

function generatePreviewHTML(post) {
  const previewDate = new Date();
  const dateStr = previewDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Make all relative image URLs absolute for preview
  const baseUrl = 'https://www.securethevotemd.com';
  let content = post.content || '<p>No content yet.</p>';
  content = content.replace(/src="(\/[^"]+)"/g, `src="${baseUrl}$1"`);

  return `<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PREVIEW: ${post.title} - Secure The Vote MD</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #2d3436;
      background: #f5f5f5;
    }
    .preview-banner {
      background: #ff9800;
      color: white;
      padding: 12px 20px;
      text-align: center;
      font-weight: 600;
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: white;
      min-height: calc(100vh - 48px);
    }
    .post-header {
      margin-bottom: 40px;
      border-bottom: 2px solid #9B1E37;
      padding-bottom: 20px;
    }
    h1 {
      font-size: 2.5rem;
      color: #9B1E37;
      margin-bottom: 16px;
    }
    .post-meta {
      color: #636e72;
      font-size: 0.95rem;
    }
    .post-meta time {
      margin-right: 16px;
    }
    .category {
      background: #F6BF58;
      color: #2d3436;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 500;
    }
    .featured-image {
      margin: 30px 0;
    }
    .featured-image img {
      width: 100%;
      height: auto;
      border-radius: 8px;
    }
    .post-body {
      font-size: 1.1rem;
      line-height: 1.8;
    }
    .post-body p {
      margin-bottom: 20px;
    }
    .post-body h2 {
      color: #9B1E37;
      margin-top: 32px;
      margin-bottom: 16px;
    }
    .post-body h3 {
      color: #9B1E37;
      margin-top: 24px;
      margin-bottom: 12px;
    }
    .post-body img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 20px 0;
    }
    .post-body ul, .post-body ol {
      margin-left: 24px;
      margin-bottom: 20px;
    }
    .post-body li {
      margin-bottom: 8px;
    }
    .post-body a {
      color: #9B1E37;
      text-decoration: none;
      border-bottom: 1px solid #F6BF58;
    }
    .post-body a:hover {
      border-bottom-color: #9B1E37;
    }
    .post-body blockquote {
      border-left: 4px solid #9B1E37;
      padding-left: 20px;
      margin: 24px 0;
      font-style: italic;
      color: #636e72;
    }
  </style>
</head>
<body>
  <div class="preview-banner">
    ⚠️ PREVIEW MODE - This is how your post will look when published
  </div>
  
  <div class="container">
    <article>
      <header class="post-header">
        <h1>${post.title}</h1>
        <div class="post-meta">
          <time>${dateStr}</time>
          ${post.category ? `<span class="category">${post.category}</span>` : ''}
        </div>
      </header>

      ${post.featured_image ? `<div class="featured-image"><img src="${post.featured_image.startsWith('http') ? post.featured_image : 'https://www.securethevotemd.com' + post.featured_image}" alt="${post.title}"></div>` : ''}

      <div class="post-body">
        ${content}
      </div>
    </article>
  </div>
</body>
</html>`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    requireAuth(req);
    const post = req.body;

    if (!post.title) {
      return res.status(400).json({ error: 'Post title is required' });
    }

    const html = generatePreviewHTML(post);

    // Return HTML directly
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);

  } catch (error) {
    console.error('Preview error:', error);
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};
