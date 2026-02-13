// Vercel Serverless Function - Delete Admin
const { Pool } = require('pg');
import { requireAuth } from './_auth.js';


const pool = new Pool({
  connectionString: (process.env.DATABASE_URL || '').trim(),
  ssl: { rejectUnauthorized: false }
});

module.exports = async function handler(req, res) {
  // Only allow DELETE
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify JWT token
    const user = requireAuth(req);

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Admin ID is required' });
    }

    // Don't allow deleting yourself
    if (parseInt(id) === user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await pool.query(
      'DELETE FROM admins WHERE id = $1 RETURNING email',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.status(200).json({
      success: true,
      message: `Admin ${result.rows[0].email} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting admin:', error);
    
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    res.status(500).json({ error: 'Failed to delete admin' });
  }
}

