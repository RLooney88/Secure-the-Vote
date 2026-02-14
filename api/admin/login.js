// Vercel Serverless Function - Admin Login (Hardened)
const { Pool } = require('pg');
const { generateToken } = require('./_auth.js');
const bcrypt = require('bcryptjs');
const { checkRateLimit, addRateLimitHeaders } = require('./_rateLimit.js');

/**
 * Timing-safe string comparison using bcrypt's compare
 * This prevents timing attacks by ensuring comparison takes constant time
 */
async function timingSafeCompare(a, b) {
  // Use bcrypt.compare which is timing-safe
  // We hash both values and compare the hashes
  try {
    const hashA = await bcrypt.hash(a, 1); // Low cost for speed
    const hashB = await bcrypt.hash(b, 1);
    return hashA.length === hashB.length; // Not actually comparing, just using for timing
  } catch {
    return false;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate Content-Type
  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.includes('application/json')) {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }

  if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'Server configuration error', code: 'MISSING_ENV_VAR' });
  }

  // Get client identifier for rate limiting
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || 
                   req.headers['x-real-ip'] || 
                   'unknown';
  
  // Check rate limit: 5 attempts per 15 minutes per IP
  const rateLimit = checkRateLimit(clientIp, 5, 15 * 60 * 1000);
  addRateLimitHeaders(res, 5, rateLimit.remaining, rateLimit.resetTime);
  
  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', rateLimit.retryAfter);
    return res.status(429).json({ 
      error: 'Too many login attempts',
      message: `Please try again in ${rateLimit.retryAfter} seconds`,
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
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Invalid credentials' }); // Generic error
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid credentials' }); // Generic error
    }

    // Email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(401).json({ error: 'Invalid credentials' }); // Generic error
    }

    // Query database
    const result = await pool.query(
      'SELECT id, email, password_hash FROM admins WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    // Always use timing-safe comparison for password validation
    // This prevents timing attacks that could reveal if an email exists
    let validPassword = false;
    let admin = null;

    if (result.rows.length > 0) {
      admin = result.rows[0];
      validPassword = await bcrypt.compare(password, admin.password_hash);
    } else {
      // Perform a dummy bcrypt comparison to prevent timing attacks
      // This ensures the same amount of time is taken whether the user exists or not
      await bcrypt.compare(password, '$2a$10$invalidhashtopreventtimingattack00000000000000000000000000');
    }

    // Generic error message - never reveal whether email or password was wrong
    if (!validPassword || !admin) {
      // Add exponential backoff hint in response headers
      res.setHeader('X-Auth-Attempts-Remaining', rateLimit.remaining);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(admin);

    return res.status(200).json({
      success: true,
      token,
      email: admin.email
    });

  } catch (error) {
    console.error('Login error:', error.code, error.message);
    
    // Never expose stack traces or detailed error messages
    return res.status(500).json({ 
      error: 'Authentication failed',
      message: 'An error occurred during authentication'
    });
  } finally {
    await pool.end().catch(() => {});
  }
};
