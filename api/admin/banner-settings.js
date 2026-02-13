// API endpoint for banner settings (toggle, reorder)
const { Pool } = require('pg');
const { requireAuth } = require('./_auth.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pool = new Pool({
    connectionString: (process.env.DATABASE_URL || '').trim(),
    ssl: { rejectUnauthorized: false },
    max: 1
  });

  try {
    const admin = requireAuth(req);
    const { bannerEnabled, slideOrder } = req.body;

    // Update banner enabled setting
    if (typeof bannerEnabled === 'boolean') {
      await pool.query(
        `INSERT INTO site_settings (key, value, updated_at)
         VALUES ('banner_enabled', $1, CURRENT_TIMESTAMP)
         ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP`,
        [bannerEnabled.toString()]
      );
    }

    // Update slide order
    if (Array.isArray(slideOrder)) {
      for (let i = 0; i < slideOrder.length; i++) {
        await pool.query(
          'UPDATE banner_slides SET sort_order = $1 WHERE id = $2',
          [i, slideOrder[i]]
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Banner settings updated successfully'
    });

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
