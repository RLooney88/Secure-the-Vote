// Vercel Serverless Function - List Admins
const { Pool } = require('pg');
import { requireAuth } from './_auth.js';


const pool = new Pool({
  connectionString: (process.env.DATABASE_URL || '').trim(),
  ssl: { rejectUnauthorized: false }
});

module.exports = async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify JWT token
    const user = requireAuth(req);

    const result = await pool.query(
      'SELECT id, email, created_at FROM admins ORDER BY created_at DESC'
    );

    // Mark current user
    const admins = result.rows.map(admin => ({
      ...admin,
      is_current: admin.id === user.id
    }));

    res.status(200).json({
      success: true,
      admins
    });
  } catch (error) {
    console.error('Error listing admins:', error);
    
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    res.status(500).json({ error: 'Failed to list admins' });
  }
}

