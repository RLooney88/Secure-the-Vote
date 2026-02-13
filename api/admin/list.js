const { Pool } = require('pg');
const { requireAuth } = require('./_auth.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const pool = new Pool({ connectionString: (process.env.DATABASE_URL || '').trim(), ssl: { rejectUnauthorized: false }, max: 1 });

  try {
    const user = requireAuth(req);
    const result = await pool.query('SELECT id, email, created_at FROM admins ORDER BY created_at DESC');
    const admins = result.rows.map(admin => ({ ...admin, is_current: admin.id === user.id }));
    return res.status(200).json({ success: true, admins });
  } catch (error) {
    console.error('List admins error:', error.message);
    if (error.message === 'Unauthorized') return res.status(401).json({ error: 'Unauthorized' });
    return res.status(500).json({ error: 'Failed to list admins' });
  } finally {
    await pool.end().catch(() => {});
  }
};
