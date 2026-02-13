const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const setupToken = req.headers['x-setup-token'] || req.query.token;
  if (setupToken !== process.env.SETUP_TOKEN) return res.status(401).json({ error: 'Invalid setup token' });

  const pool = new Pool({ connectionString: (process.env.DATABASE_URL || '').trim(), ssl: { rejectUnauthorized: false }, max: 1 });

  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO admins (email, password_hash) VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET password_hash = $2
       RETURNING id, email, created_at`,
      [email.toLowerCase(), passwordHash]
    );

    return res.status(200).json({ success: true, message: 'Admin account created/updated', admin: { id: result.rows[0].id, email: result.rows[0].email } });
  } catch (error) {
    console.error('Setup error:', error.message);
    return res.status(500).json({ error: 'Failed to create admin account' });
  } finally {
    await pool.end().catch(() => {});
  }
};
