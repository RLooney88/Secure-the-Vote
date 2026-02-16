// Vercel Serverless Function - Admin Login (Hardened with Email Verification)
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { checkRateLimit, addRateLimitHeaders } = require('./_rateLimit.js');
const sgMail = require('@sendgrid/mail');
const { wrapEmail } = require('../lib/email-template.js');

// Simple crypto for verification token
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Query database
    const result = await pool.query(
      'SELECT id, email, password_hash FROM admins WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    // Timing-safe password comparison
    let validPassword = false;
    let admin = null;

    if (result.rows.length > 0) {
      admin = result.rows[0];
      validPassword = await bcrypt.compare(password, admin.password_hash);
    } else {
      // Dummy comparison to prevent timing attacks
      await bcrypt.compare(password, '$2a$10$invalidhashtopreventtimingattack00000000000000000000000000');
    }

    // Generic error message
    if (!validPassword || !admin) {
      res.setHeader('X-Auth-Attempts-Remaining', rateLimit.remaining);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate 6-digit verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store verification token
    await pool.query(
      `INSERT INTO admin_auth_tokens (email, token, expires_at) VALUES ($1, $2, $3)`,
      [email.toLowerCase().trim(), verificationCode, expiresAt]
    );

    // Send verification email via SendGrid
    const emailSent = await sendVerificationEmail(email, verificationCode);

    if (!emailSent) {
      console.log('SendGrid not configured - verification code logged for dev:', verificationCode);
    }

    // Return response indicating verification is needed
    return res.status(200).json({
      success: true,
      requiresVerification: true,
      email: email,
      message: 'Verification code sent to your email'
    });

  } catch (error) {
    console.error('Login error:', error.code, error.message);
    return res.status(500).json({ 
      error: 'Authentication failed',
      message: 'An error occurred during authentication'
    });
  } finally {
    await pool.end().catch(() => {});
  }
};

// Send verification email via SendGrid
async function sendVerificationEmail(email, code) {
  const apiKey = process.env.SENDGRID_API_KEY;
  
  if (!apiKey) {
    console.log('SENDGRID_API_KEY not configured');
    return false;
  }

  sgMail.setApiKey(apiKey);

  const recipientName = email.split('@')[0] || 'Admin';

  // Generate branded HTML using the template system
  const html = wrapEmail({
    recipientName: recipientName,
    subject: 'Your SecureTheVoteMD Verification Code',
    headline: 'Verify Your Login',
    body: `<p>Your verification code is:</p>
<div style="background:#f5f5f5;padding:20px;text-align:center;font-size:32px;letter-spacing:8px;font-weight:bold;margin:20px 0;border-radius:8px;color:#333;">${code}</div>
<p style="color:#666;font-size:14px;">This code expires in 15 minutes. If you didn't request this, please ignore this email.</p>`
  });

  const text = `SECURETHEVOTEMD - VERIFICATION CODE

Hello ${recipientName},

Your verification code is: ${code}

This code expires in 15 minutes.

If you didn't request this email, please ignore it.

- The SecureTheVoteMD Team`;

  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@securethevotemd.com',
    subject: 'Your SecureTheVoteMD Verification Code',
    html: html,
    text: text
  };

  try {
    await sgMail.send(msg);
    console.log('Verification email sent to:', email);
    return true;
  } catch (error) {
    console.error('SendGrid error:', error.response?.body?.errors || error.message);
    return false;
  }
}