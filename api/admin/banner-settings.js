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

  // Get current file
  const getResp = await fetch(apiBase, { headers });
  if (!getResp.ok) return { updated: false, reason: `Failed to read ${path}: ${getResp.status}` };
  const fileData = await getResp.json();

  // Decode content
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  const newContent = contentUpdater(currentContent);

  if (newContent === currentContent) return { updated: false, reason: 'No changes needed' };

  // Update file
  const putResp = await fetch(apiBase, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Update banner via admin dashboard',
      content: Buffer.from(newContent).toString('base64'),
      sha: fileData.sha
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

      // Update index.html via GitHub API
      const deployResult = await updateGitHubFile('dist/index.html', (html) => {
        // Replace the marquee and its container
        return html.replace(
          /<marquee[^>]*>[\s\S]*?<\/marquee>/i,
          newMarquee
        ).replace(
          /<!-- banner disabled -->/,
          newMarquee === '<!-- banner disabled -->' ? newMarquee : newMarquee
        );
      });

      return res.status(200).json({
        success: true,
        message: 'Banner settings updated successfully',
        deployed: deployResult.updated,
        deployMessage: deployResult.reason || 'Auto-deployed to Vercel'
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
