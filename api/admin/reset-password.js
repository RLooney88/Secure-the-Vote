/**
 * Admin Password Reset Endpoint
 * POST /api/admin/reset-password
 * 
 * Accepts email, token, and new password, validates and updates password
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { enforceRateLimit, addRateLimitHeaders } = require('./_rateLimit');

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, token, newPassword } = req.body;

  // Validate input
  if (!email || !token || !newPassword) {
    return res.status(400).json({ error: 'Email, token, and new password are required' });
  }

  // Validate password strength (minimum 8 characters)
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  try {
    // Find the reset token
    const tokenResult = await req.db.query(`
      SELECT id, email, expires_at, used
      FROM admin_auth_tokens
      WHERE token = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [token]);

    const tokenRecord = tokenResult.rows[0];

    // Check if token exists and matches email
    if (!tokenRecord || tokenRecord.email !== email.toLowerCase().trim()) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Check if token has already been used
    if (tokenRecord.used) {
      return res.status(400).json({ error: 'This reset link has already been used' });
    }

    // Check if token has expired
    if (new Date() > new Date(tokenRecord.expires_at)) {
      return res.status(400).json({ error: 'This reset link has expired' });
    }

    // Hash new password with bcrypt (salt rounds 10)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update admin password
    await req.db.query(`
      UPDATE admins
      SET password_hash = $1
      WHERE email = $2
    `, [passwordHash, email.toLowerCase().trim()]);

    // Mark token as used
    await req.db.query(`
      UPDATE admin_auth_tokens
      SET used = true
      WHERE id = $1
    `, [tokenRecord.id]);

    res.status(200).json({
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};