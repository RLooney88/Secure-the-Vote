// Publish all draft posts to production, generate HTML, and push to GitHub
const { Pool } = require('pg');
const { requireAuth } = require('../_auth.js');
const { generatePostHTML } = require('./generate-page.js');
const { generateSitemap } = require('./update-sitemap.js');
const { findRelatedPosts, generateRelatedPostsHTML } = require('./internal-links.js');

// Push files to GitHub using Trees API
async function pushToGitHub(files) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.log('No GITHUB_TOKEN configured, skipping GitHub push');
    return { pushed: false, reason: 'No GITHUB_TOKEN configured' };
  }

  const repo = 'RLooney88/Secure-the-Vote';
  const branch = 'staging';
  
  try {
    // Get current staging branch SHA
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

    // Create tree with all new files
    const treeItems = files.map(file => ({
      path: file.path,
      mode: '100644',
      type: 'blob',
      content: file.content
    }));

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
          tree: treeItems,
          base_tree: currentSha
        })
      }
    );

    if (!treeResp.ok) {
      throw new Error(`Failed to create tree: ${treeResp.status}`);
    }

    const treeData = await treeResp.json();

    // Create commit
    const commitMessage = `Auto-publish blog posts: ${files.length} file${files.length === 1 ? '' : 's'}`;
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
          message: commitMessage,
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

    // Update branch reference
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

    return {
      pushed: true,
      sha: commitData.sha.substring(0, 7),
      message: commitMessage,
      filesCount: files.length
    };

  } catch (error) {
    console.error('GitHub push error:', error);
    return {
      pushed: false,
      reason: error.message
    };
  }
}

// Buffer files as pending edits
async function bufferPendingEdits(files) {
  if (!process.env.SITE_BUILDER_DATABASE_URL) {
    return { buffered: false, reason: 'No SITE_BUILDER_DATABASE_URL configured' };
  }

  const pool = new Pool({
    connectionString: (process.env.SITE_BUILDER_DATABASE_URL || '').trim(),
    ssl: { rejectUnauthorized: false },
    max: 1
  });

  try {
    for (const file of files) {
      await pool.query(
        `INSERT INTO pending_edits (id, site_id, file_path, content, change_description, status, created_at, updated_at)
         VALUES (gen_random_uuid(), 'securethevotemd', $1, $2, $3, 'pending', NOW(), NOW())
         ON CONFLICT (site_id, file_path, status)
         DO UPDATE SET content = EXCLUDED.content, change_description = EXCLUDED.change_description, updated_at = NOW()`,
        [file.path, file.content, `Auto-publish post: ${file.postTitle}`]
      );
    }

    return { buffered: true, filesCount: files.length };
  } catch (error) {
    console.error('Pending edits buffer error:', error);
    return {
      buffered: false,
      reason: error.message
    };
  } finally {
    await pool.end().catch(() => {});
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
    requireAuth(req);

    // Update all draft posts to published
    const result = await pool.query(
      `UPDATE posts 
       SET status = 'published', published_at = NOW() 
       WHERE status = 'draft' 
       RETURNING id, title, slug, content, excerpt, category, seo_title, seo_description, og_image, author_email, published_at`
    );

    if (result.rowCount === 0) {
      return res.status(200).json({
        success: true,
        publishedCount: 0,
        message: 'No draft posts to publish'
      });
    }

    const publishedPosts = result.rows;

    // Generate HTML pages for each published post
    const filesToPush = [];
    const filesToBuffer = [];

    for (const post of publishedPosts) {
      try {
        let html = generatePostHTML(post);
        
        // Find and append related posts for internal linking
        try {
          const relatedPosts = await findRelatedPosts(post.title, post.content, post.id, 3);
          if (relatedPosts.length > 0) {
            const relatedPostsHtml = generateRelatedPostsHTML(relatedPosts);
            // Insert before comments section
            html = html.replace('</div>\n      </div>\n\n      <section id="comments"', `${relatedPostsHtml}\n      </div>\n\n      <section id="comments"`);
          }
        } catch (error) {
          console.warn(`Failed to fetch related posts for ${post.id}:`, error.message);
        }
        
        // Create file path (YYYY/MM/DD/slug/index.html)
        const publishDate = new Date(post.published_at || new Date());
        const year = publishDate.getFullYear();
        const month = String(publishDate.getMonth() + 1).padStart(2, '0');
        const day = String(publishDate.getDate()).padStart(2, '0');
        const filePath = `dist/${year}/${month}/${day}/${post.slug}/index.html`;

        filesToPush.push({
          path: filePath,
          content: html,
          postTitle: post.title
        });

        filesToBuffer.push({
          path: filePath,
          content: html,
          postTitle: post.title
        });

      } catch (error) {
        console.error(`Failed to generate HTML for post ${post.id}:`, error);
      }
    }

    // Generate and include sitemap.xml
    let sitemapXml = '';
    try {
      sitemapXml = await generateSitemap();
      filesToPush.push({
        path: 'dist/sitemap.xml',
        content: sitemapXml,
        postTitle: 'Sitemap'
      });
      // Do not add sitemap.xml to pending preview queue (system file, not user-previewable)
    } catch (error) {
      console.warn('Failed to generate sitemap:', error.message);
    }

    // Generate and include robots.txt
    const robotsTxt = `User-agent: *
Allow: /
Sitemap: https://securethevotemd.com/sitemap.xml`;
    
    filesToPush.push({
      path: 'dist/robots.txt',
      content: robotsTxt,
      postTitle: 'Robots.txt'
    });
    // Do not add robots.txt to pending preview queue (system file, not user-previewable)

    // Push to GitHub
    let githubResult = { pushed: false };
    if (filesToPush.length > 0) {
      githubResult = await pushToGitHub(filesToPush);
    }

    // Buffer pending edits
    let bufferResult = { buffered: false };
    if (filesToBuffer.length > 0) {
      bufferResult = await bufferPendingEdits(filesToBuffer);
    }

    return res.status(200).json({
      success: true,
      publishedCount: publishedPosts.length,
      posts: publishedPosts.map(p => ({ id: p.id, title: p.title })),
      github: githubResult,
      buffer: bufferResult,
      message: `Published ${publishedPosts.length} post${publishedPosts.length === 1 ? '' : 's'}`
    });

  } catch (error) {
    console.error('Publish drafts error:', error);
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(500).json({ error: 'Failed to publish drafts', details: error.message });
  } finally {
    await pool.end().catch(() => {});
  }
};
