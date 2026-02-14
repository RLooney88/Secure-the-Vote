// API endpoint for banner settings (simple text/link/toggle - Fix 2)
const { Pool } = require('pg');
const { requireAuth } = require('./_auth.js');

module.exports = async function handler(req, res) {
  const pool = new Pool({
    connectionString: (process.env.DATABASE_URL || '').trim(),
    ssl: { rejectUnauthorized: false },
    max: 1
  });

  try {
    const admin = requireAuth(req);

    if (req.method === 'GET') {
      // Load banner settings
      const result = await pool.query(
        `SELECT key, value FROM site_settings 
         WHERE key IN ('banner_text', 'banner_link', 'banner_enabled')`
      );

      const settings = {};
      result.rows.forEach(row => {
        settings[row.key] = row.value;
      });

      return res.status(200).json({
        success: true,
        settings: {
          banner_text: settings.banner_text || '',
          banner_link: settings.banner_link || '',
          banner_enabled: settings.banner_enabled || 'false'
        }
      });

    } else if (req.method === 'PUT') {
      // Save banner settings
      const { banner_text, banner_link, banner_enabled } = req.body;

      if (banner_text !== undefined) {
        await pool.query(
          `INSERT INTO site_settings (key, value, updated_at)
           VALUES ('banner_text', $1, CURRENT_TIMESTAMP)
           ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP`,
          [banner_text]
        );
      }

      if (banner_link !== undefined) {
        await pool.query(
          `INSERT INTO site_settings (key, value, updated_at)
           VALUES ('banner_link', $1, CURRENT_TIMESTAMP)
           ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP`,
          [banner_link]
        );
      }

      if (banner_enabled !== undefined) {
        await pool.query(
          `INSERT INTO site_settings (key, value, updated_at)
           VALUES ('banner_enabled', $1, CURRENT_TIMESTAMP)
           ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP`,
          [banner_enabled]
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Banner settings updated successfully'
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Banner settings error:', error);
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await pool.end().catch(() => {});
  }
};
