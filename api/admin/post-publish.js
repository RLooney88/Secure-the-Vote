// API endpoint to publish a post (generates HTML and commits to GitHub)
const { Pool } = require('pg');
const { requireAuth } = require('./_auth.js');
const { generateSitemap } = require('./posts/update-sitemap.js');
const { generatePostHTML } = require('./posts/generate-page.js');

async function pushToGitHub(files) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.log('No GITHUB_TOKEN configured, skipping GitHub push');
    return { pushed: false, reason: 'No GITHUB_TOKEN configured' };
  }

  const repo = 'RLooney88/Secure-the-Vote';
  const branch = 'staging';

  try {
    const refResp = await fetch(
      `https://api.github.com/repos/${repo}/git/refs/heads/${branch}`,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'SecureTheVote-Admin'
        }
      }
    );

    if (!refResp.ok) {
      throw new Error(`Failed to get branch ref: ${refResp.status}`);
    }

    const refData = await refResp.json();
    const currentSha = refData.object.sha;

    const treeResp = await fetch(
      `https://api.github.com/repos/${repo}/git/trees`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'SecureTheVote-Admin',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tree: files.map(file => ({
            path: file.path,
            mode: '100644',
            type: 'blob',
            content: file.content
          })),
          base_tree: currentSha
        })
      }
    );

    if (!treeResp.ok) {
      throw new Error(`Failed to create tree: ${treeResp.status}`);
    }

    const treeData = await treeResp.json();

    const commitResp = await fetch(
      `https://api.github.com/repos/${repo}/git/commits`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'SecureTheVote-Admin',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Auto-publish blog post: ${files[0]?.postTitle || 'post'}`,
          tree: treeData.sha,
          parents: [currentSha],
          author: {
            name: 'SecureTheVote Admin',
            email: 'admin@securethevotemd.com',
            date: new Date().toISOString()
          }
        })
      }
    );

    if (!commitResp.ok) {
      throw new Error(`Failed to create commit: ${commitResp.status}`);
    }

    const commitData = await commitResp.json();

    const updateResp = await fetch(
      `https://api.github.com/repos/${repo}/git/refs/heads/${branch}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'SecureTheVote-Admin',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sha: commitData.sha,
          force: false
        })
      }
    );

    if (!updateResp.ok) {
      throw new Error(`Failed to update branch: ${updateResp.status}`);
    }

    return { pushed: true, sha: commitData.sha.substring(0, 7) };
  } catch (error) {
    console.error('GitHub push error:', error);
    return { pushed: false, reason: error.message };
  }
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
    const html = generatePostHTML({ ...post, published_at: publishDate, url });

    const filesToPush = [
      { path: filePath, content: html, postTitle: post.title }
    ];

    try {
      const sitemapXml = await generateSitemap();
      filesToPush.push({ path: 'dist/sitemap.xml', content: sitemapXml, postTitle: 'Sitemap' });
    } catch (sitemapErr) {
      console.warn('Failed to generate sitemap:', sitemapErr.message);
    }

    filesToPush.push({
      path: 'dist/robots.txt',
      content: `User-agent: *\nAllow: /\nSitemap: https://securethevotemd.com/sitemap.xml`,
      postTitle: 'Robots.txt'
    });

    const github = await pushToGitHub(filesToPush);

    // Buffer the post HTML as a pending edit too
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
      github,
      message: github.pushed
        ? 'Post published and pushed to staging successfully.'
        : (buffered ? 'Post published and buffered, but GitHub push failed.' : 'Post published, but GitHub push failed and no pending edit was buffered.')
    });
  } catch (error) {
    console.error('Error publishing post:', error);
    return res.status(500).json({ error: 'Failed to publish post', details: error.message });
  } finally {
    await pool.end();
  }
};

