const { Pool } = require('pg');
const { requireAuth } = require('./_auth.js');

// GitHub API helper to update a file
async function updateGitHubFile(path, contentUpdater) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { updated: false, reason: 'No GITHUB_TOKEN configured' };

  const repo = 'RLooney88/Secure-the-Vote';
  const apiBase = `https://api.github.com/repos/${repo}/contents/${path}`;
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'SecureTheVote-Admin'
  };

  // Get current file from staging branch
  const getResp = await fetch(`${apiBase}?ref=staging`, { headers });
  if (!getResp.ok) return { updated: false, reason: `Failed to read ${path}: ${getResp.status}` };
  const fileData = await getResp.json();

  // Decode content
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  const newContent = contentUpdater(currentContent);

  if (newContent === currentContent) return { updated: false, reason: 'No changes needed' };

  // Update file on staging branch
  const putResp = await fetch(apiBase, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Update banner via admin dashboard',
      content: Buffer.from(newContent).toString('base64'),
      sha: fileData.sha,
      branch: 'staging'
    })
  });

  if (!putResp.ok) return { updated: false, reason: `Failed to update: ${putResp.status}` };
  return { updated: true };
}

module.exports = async function handler(req, res) {
  const pool = new Pool({
    connectionString: (process.env.DATABASE_URL || '').trim(),
    ssl: { rejectUnauthorized: false },
    max: 1
  });

  try {
    requireAuth(req);

    if (req.method === 'GET') {
      const result = await pool.query(
        "SELECT key, value FROM site_settings WHERE key IN ('banner_text', 'banner_link', 'banner_enabled')"
      );
      const settings = {};
      result.rows.forEach(row => { settings[row.key] = row.value; });

      return res.status(200).json({
        success: true,
        settings: {
          banner_text: settings.banner_text || '',
          banner_link: settings.banner_link || '',
          banner_enabled: settings.banner_enabled || 'false'
        }
      });

    } else if (req.method === 'PUT') {
      const { banner_text, banner_link, banner_enabled } = req.body;

      // Save to database
      const updates = { banner_text, banner_link, banner_enabled };
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          await pool.query(
            `INSERT INTO site_settings (key, value, updated_at)
             VALUES ($1, $2, CURRENT_TIMESTAMP)
             ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
            [key, value]
          );
        }
      }

      // Read back current settings
      const result = await pool.query(
        "SELECT key, value FROM site_settings WHERE key IN ('banner_text', 'banner_link', 'banner_enabled')"
      );
      const settings = {};
      result.rows.forEach(row => { settings[row.key] = row.value; });

      const text = settings.banner_text || '';
      const link = settings.banner_link || '';
      const enabled = settings.banner_enabled === 'true';

      // Generate new marquee HTML
      let newMarquee;
      if (enabled && text) {
        const linkHtml = link
          ? `<a href="${link}">${text}</a>`
          : text;
        newMarquee = `<marquee scrolldelay="10" height="35px" vspace="1%" hspace="1%" scrollamount="5" behavior="scroll" direction="left">\n    ${linkHtml} \n</marquee>`;
      } else {
        newMarquee = '<!-- banner disabled -->';
      }

      // Read current index.html from GitHub (main branch = production)
      const token = process.env.GITHUB_TOKEN;
      const repo = 'RLooney88/Secure-the-Vote';
      const filePath = 'dist/index.html';
      const headers = {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SecureTheVote-Admin'
      };

      // Buffer the edit via the Site Builder AI API (which manages pending_edits)
      let buffered = false;
      const SITE_BUILDER_API = 'https://site-builder-ai-production.up.railway.app';
      const SITE_ID = 'securethevotemd';

      try {
        // Read current file (checks pending edits first, then GitHub)
        const readResp = await fetch(`${SITE_BUILDER_API}/sites/${SITE_ID}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Use the read_file tool to read dist/index.html and return its full content.`,
            sessionId: 'banner-edit-session'
          })
        });

        // Simpler approach: read from GitHub directly, write via pending_edits on the site-builder DB
        const getResp = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}?ref=main`, { headers });
        let currentHtml;
        if (getResp.ok) {
          const fileData = await getResp.json();
          currentHtml = Buffer.from(fileData.content, 'base64').toString('utf8');
        }

        if (currentHtml) {
          const updatedHtml = currentHtml.replace(
            /<marquee[^>]*>[\s\S]*?<\/marquee>/i,
            newMarquee
          ).replace(
            /<!-- banner disabled -->/,
            newMarquee === '<!-- banner disabled -->' ? newMarquee : newMarquee
          );

          // Write to pending_edits on the SITE BUILDER database (not the Vercel DB)
          const { Pool: Pool2 } = require('pg');
          const siteBuilderPool = new Pool2({
            connectionString: process.env.SITE_BUILDER_DATABASE_URL || process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            max: 1
          });

          try {
            await siteBuilderPool.query(
              `INSERT INTO pending_edits (id, site_id, file_path, content, change_description, status, created_at)
               VALUES (gen_random_uuid(), $1, $2, $3, $4, 'pending', NOW())
               ON CONFLICT (site_id, file_path, status) WHERE status = 'pending'
               DO UPDATE SET content = $3, change_description = $4, created_at = NOW()`,
              [SITE_ID, filePath, updatedHtml, `Banner update: ${enabled ? text.substring(0, 50) : 'disabled'}`]
            );
            buffered = true;
          } finally {
            await siteBuilderPool.end().catch(() => {});
          }
        }
      } catch (bufferErr) {
        console.error('Failed to buffer banner edit:', bufferErr.message);
      }

      return res.status(200).json({
        success: true,
        message: buffered
          ? 'Banner settings updated! Click "Preview Edits" to see changes.'
          : 'Banner settings saved to database. Preview buffering failed.',
        buffered,
        pendingPreview: buffered ? 'Click "Preview Edits" to see changes' : 'Could not buffer edit'
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Banner settings error:', error);
    if (error.message === 'Unauthorized') return res.status(401).json({ error: 'Unauthorized' });
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await pool.end().catch(() => {});
  }
};
