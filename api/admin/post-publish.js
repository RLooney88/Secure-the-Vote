// API endpoint to publish a post (generates HTML and commits to GitHub)
const { Pool } = require('pg');
const { requireAuth } = require('./_auth.js');

// Generate post HTML matching WordPress/Elementor structure
function generatePostHTML(post) {
  const publishDate = new Date(post.published_at || new Date());
  const dateStr = publishDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const escapedTitle = (post.title || '').replace(/"/g, '&quot;');
  const escapedDescription = (post.seo_description || post.excerpt || '').replace(/"/g, '&quot;');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
<link rel="icon" href="/images/2024/04/cropped-favicon-2-32x32.png" sizes="32x32">
<link rel="icon" href="/images/2024/04/cropped-favicon-2-192x192.png" sizes="192x192">
<link rel="apple-touch-icon" href="/images/2024/04/cropped-favicon-2-180x180.png">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapedTitle} - Secure The Vote MD</title>
  <link rel="stylesheet" id="embed-pdf-viewer-css" href="/wp-content/plugins/embed-pdf-viewer/css/embed-pdf-viewer.css?ver=2.4.7" media="screen">
  <link rel="stylesheet" id="elementor-frontend-css" href="/wp-content/plugins/elementor/assets/css/frontend.min.css?ver=3.35.4" media="all">
  <link rel="stylesheet" id="elementor-post-27-css" href="/images/elementor/css/post-27.css?ver=1770997505" media="all">
  <link rel="stylesheet" id="elementor-post-28-css" href="/images/elementor/css/post-28.css?ver=1770997506" media="all">
  <link rel="stylesheet" id="embedpress-css-css" href="/wp-content/plugins/embedpress/assets/css/embedpress.css?ver=1769615293" media="all">
  <link rel="stylesheet" id="embedpress-blocks-style-css" href="/wp-content/plugins/embedpress/assets/css/blocks.build.css?ver=1769615293" media="all">
  <link rel="stylesheet" id="embedpress-lazy-load-css-css" href="/wp-content/plugins/embedpress/assets/css/lazy-load.css?ver=1769615293" media="all">
  <link rel="stylesheet" id="wp-block-library-css" href="/wp-includes/css/dist/block-library/style.min.css?ver=6.9.1" media="all">
  <link rel="stylesheet" id="contact-form-7-css" href="/wp-content/plugins/contact-form-7/includes/css/styles.css?ver=6.1.5" media="all">
  <link rel="stylesheet" id="hello-elementor-css" href="/wp-content/themes/hello-elementor/assets/css/reset.css?ver=3.4.6" media="all">
  <link rel="stylesheet" id="hello-elementor-theme-style-css" href="/wp-content/themes/hello-elementor/assets/css/theme.css?ver=3.4.6" media="all">
  <link rel="stylesheet" id="hello-elementor-header-footer-css" href="/wp-content/themes/hello-elementor/assets/css/header-footer.css?ver=3.4.6" media="all">
  <link rel="stylesheet" id="elementor-post-6-css" href="/images/elementor/css/post-6.css?ver=1770997506" media="all">
  <link rel="stylesheet" id="hello-elementor-child-style-css" href="/wp-content/themes/hello-theme-child-master/style.css?ver=2.0.0" media="all">
  <link rel="stylesheet" id="font-awesome-5-all-css" href="/wp-content/plugins/elementor/assets/lib/font-awesome/css/all.min.css?ver=3.35.4" media="all">
  <link rel="stylesheet" id="font-awesome-4-shim-css" href="/wp-content/plugins/elementor/assets/lib/font-awesome/css/v4-shims.min.css?ver=3.35.4" media="all">
  <link rel="stylesheet" id="ekit-widget-styles-css" href="/wp-content/plugins/elementskit-lite/widgets/init/assets/css/widget-styles.css?ver=3.7.9" media="all">
  <link rel="stylesheet" id="ekit-responsive-css" href="/wp-content/plugins/elementskit-lite/widgets/init/assets/css/responsive.css?ver=3.7.9" media="all">
  <link rel="stylesheet" id="eael-general-css" href="/wp-content/plugins/essential-addons-for-elementor-lite/assets/front-end/css/view/general.min.css?ver=6.5.11" media="all">
  <link rel="stylesheet" id="elementor-gf-local-questrial-css" href="/images/elementor/google-fonts/css/questrial.css?ver=1744833050" media="all">
  <link rel="stylesheet" id="elementor-icons-ekiticons-css" href="/wp-content/plugins/elementskit-lite/modules/elementskit-icon-pack/assets/css/ekiticons.css?ver=3.7.9" media="all">
  <style id="wp-img-auto-sizes-contain-inline-css">
img:is([sizes=auto i],[sizes^="auto," i]){contain-intrinsic-size:3000px 1500px}
</style>
  <style id="wp-emoji-styles-inline-css">
img.wp-smiley, img.emoji {
  display: inline !important;
  border: none !important;
  box-shadow: none !important;
  height: 1em !important;
  width: 1em !important;
  margin: 0 0.07em !important;
  vertical-align: -0.1em !important;
  background: none !important;
  padding: 0 !important;
}
</style>
  <style id="wp-custom-css">
/* global */
p{margin:0;}

.single-post #content, .archive #content{
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.single-post .page-header, .archive .page-header{
  display:flex;
  justify-content:center;
  align-items:center;
  width: 100%;
  padding: 40px;
  min-height:50vh;
  background:#9B1E37;
  color:white;
}

.single-post .wp-post-image, .archive .wp-post-image{
  margin-bottom:20px;
}

.single-post .page-header .entry-title, .archive .page-header .entry-title {
  padding: 0;
  text-align: center;
  margin:0;
}

.single-post .page-content .entry-title, .archive .page-content .entry-title{
  margin-bottom:30px;
}

.single-post .page-content, .archive .page-content {
  font-size: 18px;
  max-width: 1200px;
  padding-top: 65px;
  text-align-last:left;
}

.archive .page-content .post{
  margin-bottom:30px;
}

.archive .page-content{
  padding-bottom: 100px;
}

.single-post .page-content h2, .archive .page-content h2{
  text-align:left;
}

.single-post #comments{
  width: 1200px;
  padding: 40px 0px 130px;
}

.single-post .submit{
  background-color:#9B1E37;
  color:white;
  padding:10px 30px;
  border:none!important;
  margin-top:30px;
}

.single-post .submit:hover{
  background-color:#F6BF58;
}

.single-post #respond{
  padding: 30px;
  background: #f1f1f1;
  margin-top:20px;
}

.single-post #content, .archive #content{
  padding:0!important;
}

@media (max-width: 1200px){
  .single-post .page-content{
    padding:55px 30px 0;
  }
  .archive .page-content{
    padding:55px 30px 100px;
  }
  .single-post #comments{
    width: inherit;
    padding: 40px 30px 130px;
  }
}
</style>
</head>
<body>
<!-- TEMPLATE INJECTION START -->
<style id="template-loading">
  body > *:not(#site-header):not(#site-footer):not(script):not(style):not(link) { opacity: 0; transition: opacity 0.2s; }
  #site-header:empty, #site-footer:empty { min-height: 0; }
</style>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<div id="site-header"></div>
<!-- TEMPLATE INJECTION END -->

<section class="elementor-section elementor-top-section stv-hero-banner elementor-section-boxed elementor-section-height-default">
<div class="elementor-background-overlay"></div>
<div class="elementor-container elementor-column-gap-default">
<div class="elementor-column elementor-col-33 elementor-top-column stv-banner-col-side"><div class="elementor-widget-wrap"></div></div>
<div class="elementor-column elementor-col-33 elementor-top-column stv-banner-col-center">
<div class="elementor-widget-wrap elementor-element-populated">
<div class="elementor-element elementor-widget elementor-widget-heading">
<div class="elementor-widget-container">
<h1 class="elementor-heading-title elementor-size-default stv-banner-title">${post.title}</h1></div>
</div>
<hr class="stv-banner-divider">
</div>
</div>
<div class="elementor-column elementor-col-33 elementor-top-column stv-banner-col-side"><div class="elementor-widget-wrap"></div></div>
</div>
</section>

<main id="content" class="site-main post type-post status-publish format-standard has-post-thumbnail hentry">

<div class="page-content">
${post.featured_image ? `<img src="${post.featured_image}" alt="${escapedTitle}" class="wp-post-image" />` : ''}
${post.content || ''}
</div>

</main>

<script src="/templates/mobile-menu.js"></script>
<script src="/js/comments.js"></script>
<!-- TEMPLATE INJECTION START -->
<div id="site-footer"></div>

<script>
// Use Shadow DOM to isolate templates from Elementor CSS
async function loadTemplate(hostId, htmlUrl, cssUrl, jsUrl) {
  const host = document.getElementById(hostId);
  const shadow = host.attachShadow({ mode: 'open' });
  
  const [htmlRes, cssRes] = await Promise.all([
    fetch(htmlUrl).then(r => r.text()),
    fetch(cssUrl).then(r => r.text())
  ]);
  
  shadow.innerHTML = '<style>' + cssRes + '</style>' + htmlRes;
  
  if (jsUrl) {
    const jsRes = await fetch(jsUrl).then(r => r.text());
    const script = document.createElement('script');
    script.textContent = jsRes;
    shadow.appendChild(script);
  }
}

// Load Font Awesome inside shadow DOMs
const faLink = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">';

fetch('https://site-builder-ai-production.up.railway.app/sites/securethevotemd/templates')
  .then(r => r.json())
  .then(templateData => {
    const headerHtml = templateData.header;
    const footerHtml = templateData.footer;
    const css = templateData.css;
  const varFix = \`<style>
    :host { display: block; width: 100%; }
    :host * { box-sizing: border-box; }
    :root, :host {
      --color-maroon: #8B1A1A;
      --color-maroon-dark: #5d1111;
      --color-red: #C41E3A;
      --color-gold: #F6BF58;
      --color-gold-dark: #d9a03f;
      --color-white: #ffffff;
      --color-black: #000000;
      --color-gray-light: #f5f5f5;
      --color-gray-medium: #666666;
      --color-gray-dark: #333333;
      --font-primary: 'Poppins', sans-serif;
      --font-secondary: 'Questrial', sans-serif;
    }
  </style>\`;
  const hShadow = document.getElementById('site-header').attachShadow({ mode: 'open' });
  hShadow.innerHTML = faLink + varFix + '<style>' + css + '</style>' + headerHtml;
  const fShadow = document.getElementById('site-footer').attachShadow({ mode: 'open' });
  fShadow.innerHTML = faLink + varFix + '<style>' + css + '</style>' + footerHtml;
  document.getElementById('template-loading').remove();
  document.querySelectorAll('body > *:not(#site-header):not(#site-footer):not(script):not(style):not(link)').forEach(el => el.style.opacity = '1');
});
</script>
<!-- TEMPLATE INJECTION END -->
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
    
    // Create file path (YYYY/MM/DD/slug/) - use UTC to match database timestamp
    const year = publishDate.getUTCFullYear();
    const month = String(publishDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(publishDate.getUTCDate()).padStart(2, '0');
    const url = `/${year}/${month}/${day}/${post.slug}/`;
    const filePath = `dist${url}index.html`;
    
    // Update post with publish date and URL
    await pool.query(
      'UPDATE posts SET status = $1, published_at = $2, url = $3 WHERE id = $4',
      ['published', publishDate, url, postId]
    );

    // Generate HTML
    const html = generatePostHTML({ ...post, published_at: publishDate });

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
          `INSERT INTO pending_edits (id, site_id, file_path, content, change_description, status, created_at, updated_at)
           VALUES (gen_random_uuid(), 'securethevotemd', $1, $2, $3, 'pending', NOW(), NOW())
           ON CONFLICT (site_id, file_path, status)
           DO UPDATE SET content = EXCLUDED.content, change_description = EXCLUDED.change_description, updated_at = NOW()`,
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
      filePath,
      buffered,
      message: buffered 
        ? 'Post published and buffered. Click "Publish Edits" to deploy.'
        : 'Post published. Use manual deploy to push to GitHub.'
    });
  } catch (error) {
    console.error('Error publishing post:', error);
    return res.status(500).json({ error: 'Failed to publish post', details: error.message });
  } finally {
    await pool.end();
  }
};
