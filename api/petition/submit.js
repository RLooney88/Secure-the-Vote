// Vercel Serverless Function - Submit Petition Signature
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');


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
    const { petition_name, full_name, email, zip_code } = req.body;

    // Validate required fields
    if (!full_name || !email) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['full_name', 'email']
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Get client IP
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || 
                      req.headers['x-real-ip'] || 
                      req.socket?.remoteAddress || 
                      '';

    // Check for duplicate signature (same email and petition)
    const existingResult = await pool.query(
      'SELECT id FROM petition_signatures WHERE email = $1 AND petition_name = $2',
      [email.toLowerCase(), petition_name || 'default']
    );

    if (existingResult.rows.length > 0) {
      return res.status(409).json({ 
        error: 'This email has already signed this petition' 
      });
    }

    // Insert signature
    const insertResult = await pool.query(
      `INSERT INTO petition_signatures (petition_name, full_name, email, zip_code, ip_address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
      [petition_name || 'default', full_name, email.toLowerCase(), zip_code || null, ipAddress]
    );

    const signature = insertResult.rows[0];

    return res.status(200).json({ 
      success: true,
      message: 'Thank you for signing the petition!',
      id: signature.id,
      created_at: signature.created_at
    });

  } catch (error) {
    console.error('Petition submission error:', error);
    return res.status(500).json({ 
      error: 'Failed to process signature',
      message: error.message 
    });
  }
}
