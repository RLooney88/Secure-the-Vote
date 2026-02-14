const { Pool } = require('pg');
const { requireAuth } = require('./_auth.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  const pool = new Pool({ connectionString: (process.env.DATABASE_URL || '').trim(), ssl: { rejectUnauthorized: false }, max: 1 });

  try {
    const user = requireAuth(req);
    const { id } = req.query;

    if (!id) return res.status(400).json({ error: 'Admin ID is required' });
    
    // Validate ID is a number to prevent SQL injection
    const adminId = parseInt(id, 10);
    if (isNaN(adminId) || adminId < 1) {
      return res.status(400).json({ error: 'Invalid admin ID' });
    }
    
    if (adminId === user.id) return res.status(400).json({ error: 'Cannot delete your own account' });

    // Use parameterized query to prevent SQL injection
    const result = await pool.query('DELETE FROM admins WHERE id = $1 RETURNING email', [adminId]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Admin not found' });

    return res.status(200).json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    // Never expose detailed error messages or stack traces
    console.error('Delete admin error:', error.message);
    if (error.message === 'Unauthorized') return res.status(401).json({ error: 'Unauthorized' });
    return res.status(500).json({ error: 'Failed to delete admin' });
  } finally {
    await pool.end().catch(() => {});
  }
};
