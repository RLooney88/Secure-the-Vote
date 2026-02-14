const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { requireAuth } = require('./_auth.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Validate Content-Type
  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.includes('application/json')) {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }

  const pool = new Pool({ connectionString: (process.env.DATABASE_URL || '').trim(), ssl: { rejectUnauthorized: false }, max: 1 });

  try {
    const admin = requireAuth(req);
    const { email, password, auto_generate } = req.body;

    if (!email) return res.status(400).json({ error: 'Email is required' });
    
    // Type validation and sanitization
    if (typeof email !== 'string') return res.status(400).json({ error: 'Invalid email type' });
    const sanitizedEmail = email.toLowerCase().trim();
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) return res.status(400).json({ error: 'Invalid email format' });

    let finalPassword;
    if (auto_generate) {
      finalPassword = require('crypto').randomBytes(16).toString('hex');
    } else if (!password) {
      return res.status(400).json({ error: 'Password is required when not auto-generating' });
    } else {
      // Type validation
      if (typeof password !== 'string') return res.status(400).json({ error: 'Invalid password type' });
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }
      if (password.length > 128) {
        return res.status(400).json({ error: 'Password too long' });
      }
      finalPassword = password;
    }

    const passwordHash = await bcrypt.hash(finalPassword, 10);

    // Use parameterized query to prevent SQL injection
    const result = await pool.query(
      `INSERT INTO admins (email, password_hash) VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET password_hash = $2, created_at = CURRENT_TIMESTAMP
       RETURNING id, email, created_at`,
      [sanitizedEmail, passwordHash]
    );

    const response = { 
      success: true, 
      message: 'Admin created successfully', 
      admin: { 
        id: result.rows[0].id, 
        email: result.rows[0].email 
      } 
    };
    if (auto_generate) response.generated_password = finalPassword;
    return res.status(201).json(response);

  } catch (error) {
    // Never expose detailed error messages or stack traces
    console.error('Create admin error:', error.message);
    if (error.message === 'Unauthorized') return res.status(401).json({ error: 'Unauthorized' });
    return res.status(500).json({ error: 'Failed to create admin' });
  } finally {
    await pool.end().catch(() => {});
  }
};
