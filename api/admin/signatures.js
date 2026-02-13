const { Pool } = require('pg');
const { requireAuth } = require('./_auth.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const pool = new Pool({ connectionString: (process.env.DATABASE_URL || '').trim(), ssl: { rejectUnauthorized: false }, max: 1 });

  try {
    requireAuth(req);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const petitionName = req.query.petition || null;

    let query = 'SELECT * FROM petition_signatures';
    const params = [];
    if (petitionName) { query += ' WHERE petition_name = $1'; params.push(petitionName); }
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    let countQuery = 'SELECT COUNT(*) FROM petition_signatures';
    if (petitionName) countQuery += ' WHERE petition_name = $1';
    const countResult = await pool.query(countQuery, petitionName ? [petitionName] : []);
    const total = parseInt(countResult.rows[0].count);

    return res.status(200).json({
      success: true,
      signatures: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Signatures error:', error.message);
    if (error.message === 'Unauthorized') return res.status(401).json({ error: 'Unauthorized' });
    return res.status(500).json({ error: 'Failed to fetch signatures' });
  } finally {
    await pool.end().catch(() => {});
  }
};
