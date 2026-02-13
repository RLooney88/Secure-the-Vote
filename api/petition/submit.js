const { Pool } = require('pg');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const pool = new Pool({ connectionString: (process.env.DATABASE_URL || '').trim(), ssl: { rejectUnauthorized: false }, max: 1 });

  try {
    const { petition_name, full_name, email, zip_code } = req.body;

    if (!full_name || !email) return res.status(400).json({ error: 'Missing required fields', required: ['full_name', 'email'] });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email format' });

    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.headers['x-real-ip'] || '';

    const existing = await pool.query(
      'SELECT id FROM petition_signatures WHERE email = $1 AND petition_name = $2',
      [email.toLowerCase(), petition_name || 'default']
    );
    if (existing.rows.length > 0) return res.status(409).json({ error: 'This email has already signed this petition' });

    const result = await pool.query(
      `INSERT INTO petition_signatures (petition_name, full_name, email, zip_code, ip_address)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`,
      [petition_name || 'default', full_name, email.toLowerCase(), zip_code || null, ipAddress]
    );

    return res.status(200).json({ success: true, message: 'Thank you for signing the petition!', id: result.rows[0].id });
  } catch (error) {
    console.error('Petition error:', error.message);
    return res.status(500).json({ error: 'Failed to process signature' });
  } finally {
    await pool.end().catch(() => {});
  }
};
