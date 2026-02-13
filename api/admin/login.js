// Vercel Serverless Function - Admin Login
const { Pool } = require('pg');
const { generateToken } = require('./_auth.js');
const bcrypt = require('bcryptjs');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'Server configuration error', code: 'MISSING_ENV_VAR' });
  }

  const pool = new Pool({
    connectionString: (process.env.DATABASE_URL || '').trim(),
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
    max: 1
  });

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query(
      'SELECT id, email, password_hash FROM admins WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = result.rows[0];
    const validPassword = await bcrypt.compare(password, admin.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(admin);

    return res.status(200).json({
      success: true,
      token,
      email: admin.email
    });

  } catch (error) {
    console.error('Login error:', error.code, error.message);
    return res.status(500).json({ error: 'Authentication failed', code: error.code || 'UNKNOWN_ERROR' });
  } finally {
    await pool.end().catch(() => {});
  }
};
