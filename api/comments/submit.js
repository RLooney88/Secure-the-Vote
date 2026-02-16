const { Pool } = require('pg');

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Rate limit cache (in production, use Redis)
const rateLimitCache = new Map();

/**
 * Strip HTML tags from string to prevent XSS
 */
function stripHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '').trim();
}

/**
 * Check rate limiting (same email, 60 second cooldown)
 */
function checkRateLimit(email) {
  const key = `comment:${email}`;
  const now = Date.now();
  const lastSubmit = rateLimitCache.get(key);
  
  if (lastSubmit && (now - lastSubmit) < 60000) {
    return false; // Rate limited
  }
  
  rateLimitCache.set(key, now);
  
  // Clean up old entries periodically
  if (rateLimitCache.size > 10000) {
    for (const [k, v] of rateLimitCache.entries()) {
      if (now - v > 300000) { // Remove entries older than 5 minutes
        rateLimitCache.delete(k);
      }
    }
  }
  
  return true;
}

/**
 * Send notification email to admin
 */
async function sendAdminNotification(comment) {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  
  if (!SENDGRID_API_KEY) {
    console.log('SendGrid not configured, logging notification instead:');
    console.log(`New comment submission from ${comment.author_name} (${comment.author_email}) on ${comment.post_slug}`);
    return;
  }

  const adminEmail = 'info@securethevotemd.com';
  const dashboardUrl = 'https://securethevotemd.com/admin/comments'; // Update if needed
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #9B1E37;">New Comment - Pending Approval</h2>
      <p><strong>Post:</strong> ${stripHtml(comment.post_slug)}</p>
      <p><strong>Author:</strong> ${stripHtml(comment.author_name)}</p>
      <p><strong>Email:</strong> ${stripHtml(comment.author_email)}</p>
      ${comment.author_website ? `<p><strong>Website:</strong> <a href="${stripHtml(comment.author_website)}">${stripHtml(comment.author_website)}</a></p>` : ''}
      <h3>Comment:</h3>
      <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #9B1E37; margin: 15px 0;">
        <p>${stripHtml(comment.content).replace(/\n/g, '<br>')}</p>
      </div>
      <p style="color: #666; font-size: 12px;">
        Submitted at: ${new Date(comment.created_at).toLocaleString()}
      </p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <a href="${dashboardUrl}" style="background: #9B1E37; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Review in Admin Dashboard</a>
      </div>
    </div>
  `;

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: adminEmail }] }],
        from: { email: 'noreply@securethevotemd.com', name: 'Secure The Vote MD' },
        subject: `New Comment on ${stripHtml(comment.post_slug)} - Pending Approval`,
        content: [{ type: 'text/html', value: htmlContent }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SendGrid error:', errorText);
    }
  } catch (error) {
    console.error('Email send error:', error.message);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.includes('application/json')) {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }

  const contentLength = parseInt(req.headers['content-length'] || '0');
  if (contentLength > 100000) {
    return res.status(413).json({ error: 'Request too large' });
  }

  const pool = new Pool({
    connectionString: (process.env.DATABASE_URL || '').trim(),
    ssl: { rejectUnauthorized: false },
    max: 1
  });

  try {
    const {
      post_slug,
      author_name,
      author_email,
      author_website,
      content
    } = req.body;

    // Validate required fields
    if (!post_slug || !author_name || !author_email || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['post_slug', 'author_name', 'author_email', 'content']
      });
    }

    // Type validation
    if (typeof post_slug !== 'string' || typeof author_name !== 'string' ||
        typeof author_email !== 'string' || typeof content !== 'string') {
      return res.status(400).json({ error: 'Invalid input types' });
    }

    // Sanitize inputs
    const sanitizedSlug = stripHtml(post_slug).substring(0, 500);
    const sanitizedName = stripHtml(author_name).substring(0, 255);
    const sanitizedEmail = author_email.toLowerCase().trim().substring(0, 255);
    const sanitizedWebsite = author_website ? stripHtml(author_website).substring(0, 500) : null;
    const sanitizedContent = stripHtml(content).substring(0, 5000);

    // Email format validation
    if (!EMAIL_REGEX.test(sanitizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Rate limiting check
    if (!checkRateLimit(sanitizedEmail)) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Please wait before submitting another comment'
      });
    }

    // Get client IP
    const ipAddress = (req.headers['x-forwarded-for']?.split(',')[0] || 
                       req.headers['x-real-ip'] || 
                       req.connection?.remoteAddress || 
                       '').trim().substring(0, 45);

    // Insert comment with pending status
    const result = await pool.query(
      `INSERT INTO comments (
        post_slug, author_name, author_email, author_website, content, status, ip_address, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, created_at`,
      [
        sanitizedSlug,
        sanitizedName,
        sanitizedEmail,
        sanitizedWebsite,
        sanitizedContent,
        'pending',
        ipAddress
      ]
    );

    const comment = {
      id: result.rows[0].id,
      post_slug: sanitizedSlug,
      author_name: sanitizedName,
      author_email: sanitizedEmail,
      created_at: result.rows[0].created_at
    };

    // Send admin notification
    await sendAdminNotification(comment);

    return res.status(200).json({
      success: true,
      message: 'Comment submitted successfully. It will appear after approval.',
      id: comment.id
    });

  } catch (error) {
    console.error('Comment submission error:', error.message);
    return res.status(500).json({ error: 'Failed to submit comment' });
  } finally {
    await pool.end().catch(() => {});
  }
};
