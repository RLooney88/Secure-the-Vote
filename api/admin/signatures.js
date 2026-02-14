const { Pool } = require('pg');
const { requireAuth } = require('./_auth.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const pool = new Pool({ connectionString: (process.env.DATABASE_URL || '').trim(), ssl: { rejectUnauthorized: false }, max: 1 });

  try {
    requireAuth(req);

    // Input validation and sanitization
    const pageRaw = parseInt(req.query.page, 10) || 1;
    const limitRaw = parseInt(req.query.limit, 10) || 50;
    
    // Validate and constrain inputs to prevent abuse
    const page = Math.max(1, Math.min(pageRaw, 10000)); // Max page 10000
    const limit = Math.max(1, Math.min(limitRaw, 100)); // Max 100 items per page
    const offset = (page - 1) * limit;
    
    // Sanitize petition name - only allow alphanumeric, dash, underscore
    let petitionName = null;
    if (req.query.petition) {
      const sanitized = String(req.query.petition).replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 100);
      petitionName = sanitized || null;
    }

    // Use parameterized queries to prevent SQL injection
    let query = 'SELECT * FROM petition_signatures';
    const params = [];
    if (petitionName) { 
      query += ' WHERE petition_name = $1'; 
      params.push(petitionName); 
    }
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    let countQuery = 'SELECT COUNT(*) FROM petition_signatures';
    if (petitionName) countQuery += ' WHERE petition_name = $1';
    const countResult = await pool.query(countQuery, petitionName ? [petitionName] : []);
    const total = parseInt(countResult.rows[0].count, 10);

    return res.status(200).json({
      success: true,
      signatures: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    // Never expose detailed error messages or stack traces
    console.error('Signatures error:', error.message);
    if (error.message === 'Unauthorized') return res.status(401).json({ error: 'Unauthorized' });
    return res.status(500).json({ error: 'Failed to fetch signatures' });
  } finally {
    await pool.end().catch(() => {});
  }
};
