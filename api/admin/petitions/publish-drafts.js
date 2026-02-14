// Publish all draft petitions to production
const { Pool } = require('pg');
const { requireAuth } = require('../_auth.js');

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

    // Update all draft petitions to published
    const result = await pool.query(
      `UPDATE petitions 
       SET status = 'published', updated_at = NOW() 
       WHERE status = 'draft' 
       RETURNING id, name`
    );

    return res.status(200).json({
      success: true,
      publishedCount: result.rowCount,
      petitions: result.rows
    });

  } catch (error) {
    console.error('Publish drafts error:', error);
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(500).json({ error: 'Failed to publish drafts' });
  } finally {
    await pool.end().catch(() => {});
  }
};
