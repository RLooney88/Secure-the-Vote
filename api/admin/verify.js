// Vercel Serverless Function - Admin Verification
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { checkRateLimit, addRateLimitHeaders } = require('./_rateLimit.js');

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate Content-Type
  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.includes('application/json')) {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }

  if (!process.env.DATABASE_URL || !JWT_SECRET) {
    return res.status(500).json({ error: 'Server configuration error', code: 'MISSING_ENV_VAR' });
  }

  // Get client identifier for rate limiting
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || 
                   req.headers['x-real-ip'] || 
                   'unknown';
  
  // Stricter rate limit for verification: 10 attempts per hour
  const rateLimit = checkRateLimit(clientIp, 10, 60 * 60 * 1000);
  addRateLimitHeaders(res, 10, rateLimit.remaining, rateLimit.resetTime);
  
  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', rateLimit.retryAfter);
    return res.status(429).json({ 
      error: 'Too many verification attempts',
      retryAfter: rateLimit.retryAfter
    });
  }

  const pool = new Pool({
    connectionString: (process.env.DATABASE_URL || '').trim(),
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
    max: 1
  });

  try {
    const { email, code } = req.body;

    // Input validation
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }

    if (typeof email !== 'string' || typeof code !== 'string') {
      return res.status(400).json({ error: 'Invalid input format' });
    }

    // Email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(401).json({ error: 'Invalid verification code' });
    }

    // Verify code against database
    const tokenResult = await pool.query(
      `SELECT id, email FROM admin_auth_tokens 
       WHERE token = $1 AND email = $2 AND used = FALSE AND expires_at > NOW()`,
      [code.trim(), email.toLowerCase().trim()]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired verification code' });
    }

    const tokenRecord = tokenResult.rows[0];

    // Get admin details
    const adminResult = await pool.query(
      'SELECT id, email FROM admins WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (adminResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid verification code' });
    }

    const admin = adminResult.rows[0];

    // Mark token as used
    await pool.query(
      'UPDATE admin_auth_tokens SET used = TRUE WHERE id = $1',
      [tokenRecord.id]
    );

    // Generate JWT with 8-hour expiry (NOT 24h)
    const jwtToken = jwt.sign(
      { id: admin.id, email: admin.email },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      success: true,
      token: jwtToken,
      email: admin.email
    });

  } catch (error) {
    console.error('Verification error:', error.code, error.message);
    return res.status(500).json({ 
      error: 'Verification failed',
      message: 'An error occurred during verification'
    });
  } finally {
    await pool.end().catch(() => {});
  }
};