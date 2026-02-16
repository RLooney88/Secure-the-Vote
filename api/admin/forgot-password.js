/**
 * Admin Password Reset Request Endpoint
 * POST /api/admin/forgot-password
 * 
 * Accepts email, generates reset token, stores in database, sends email
 */

const crypto = require('crypto');
const { enforceRateLimit, addRateLimitHeaders } = require('./_rateLimit');
const { wrapEmail } = require('../lib/email-template.js');
const { generatePasswordResetEmail } = require('../lib/email-templates/password-reset.js');

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limit: 3 requests per 15 minutes per IP
  const rateLimitResult = enforceRateLimit(req.headers['x-forwarded-for'] || req.socket.remoteAddress, {
    maxAttempts: 3,
    windowMs: 15 * 60 * 1000 // 15 minutes
  });

  if (rateLimitResult) {
    addRateLimitHeaders(res, 3, rateLimitResult.remaining, rateLimitResult.resetTime);
    res.setHeader('Retry-After', rateLimitResult.retryAfter);
    return res.status(429).json({
      error: 'Too many requests',
      message: `Rate limit exceeded. Please try again in ${rateLimitResult.retryAfter} seconds.`,
      retryAfter: rateLimitResult.retryAfter
    });
  }

  try {
    const { email } = req.body;

    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if admin exists
    const adminResult = await req.db.query('SELECT id, email FROM admins WHERE email = $1', [email.toLowerCase().trim()]);
    
    const admin = adminResult.rows[0];

    // ALWAYS return success even if email not found (prevent enumeration)
    if (!admin) {
      // Add small random delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
      return res.status(200).json({
        message: 'If an account exists with that email address, a password reset link has been sent.'
      });
    }

    // Generate secure reset token (32 bytes = 64 hex characters)
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Calculate expiry time (30 minutes from now)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // Store token in database
    await req.db.query(`
      INSERT INTO admin_auth_tokens (email, token, expires_at, used, created_at)
      VALUES ($1, $2, $3, false, NOW())
    `, [admin.email, resetToken, expiresAt]);

    // Generate reset link
    const resetLink = `https://www.securethevotemd.com/admin/?reset=${resetToken}&email=${encodeURIComponent(admin.email)}`;

    // Generate email content
    const emailContent = generatePasswordResetEmail({
      recipientName: admin.email.split('@')[0],
      resetLink,
      expiresIn: '30 minutes'
    });

    // Send email via SendGrid
    if (process.env.SENDGRID_API_KEY) {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      await sgMail.send({
        to: admin.email,
        from: process.env.FROM_EMAIL || 'noreply@securethevotemd.com',
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      });
    }

    // Add small random delay to prevent timing attacks
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100));

    res.status(200).json({
      message: 'If an account exists with that email address, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};