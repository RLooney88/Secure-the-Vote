// Vercel Serverless Function - Create New Admin (JWT Protected)
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
import { requireAuth } from './_auth.js';


const pool = new Pool({
  connectionString: (process.env.DATABASE_URL || '').trim(),
  ssl: { rejectUnauthorized: false }
});

module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const admin = requireAuth(req);

    const { email, password, auto_generate } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Get or generate password
    let passwordHash;
    if (auto_generate) {
      // Generate random password
      const generatedPassword = require('crypto').randomBytes(16).toString('hex');
      passwordHash = await bcrypt.hash(generatedPassword, 10);
      
      // Return the generated password to the admin
      return res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        admin: {
          email: email.toLowerCase()
        },
        generated_password: generatedPassword
      });
    }

    if (!password) {
      return res.status(400).json({ error: 'Password is required when not auto-generating' });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    passwordHash = await bcrypt.hash(password, 10);

    // Insert admin (upsert - in case it exists)
    const result = await pool.query(
      `INSERT INTO admins (email, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET password_hash = $2, created_at = CURRENT_TIMESTAMP
       RETURNING id, email, created_at`,
      [email.toLowerCase(), passwordHash]
    );

    return res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: result.rows[0].id,
        email: result.rows[0].email
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    return res.status(500).json({ error: 'Failed to create admin' });
  }
}
