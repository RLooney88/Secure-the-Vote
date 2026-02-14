const { Pool } = require('pg');
const crypto = require('crypto');

async function sendEmail(to, subject, htmlContent, cc = null, bcc = null) {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  
  if (!SENDGRID_API_KEY) {
    console.error('SENDGRID_API_KEY not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const personalizations = [{
    to: [{ email: to }]
  }];

  if (cc) personalizations[0].cc = [{ email: cc }];
  if (bcc) personalizations[0].bcc = [{ email: bcc }];

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations,
        from: { email: 'noreply@securethevotemd.com', name: 'SecureTheVoteMD' },
        subject,
        content: [{ type: 'text/html', value: htmlContent }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SendGrid error:', errorText);
      return { success: false, error: 'Email send failed' };
    }

    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const pool = new Pool({ 
    connectionString: (process.env.DATABASE_URL || '').trim(), 
    ssl: { rejectUnauthorized: false }, 
    max: 1 
  });

  try {
    const { 
      petition_name, 
      full_name, 
      email, 
      zip_code,
      street,
      city,
      state,
      country,
      anonymous,
      optin,
      custom_data,
      petition_message
    } = req.body;

    // Validate required fields
    if (!full_name || !email) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['full_name', 'email'] 
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Get petition details
    const petitionResult = await pool.query(
      `SELECT * FROM petitions WHERE name = $1 AND active = true`,
      [petition_name || 'default']
    );

    if (petitionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Petition not found or inactive' });
    }

    const petition = petitionResult.rows[0];

    // Check expiration
    if (petition.expires && petition.expiration_date) {
      const expirationDate = new Date(petition.expiration_date);
      if (expirationDate < new Date()) {
        return res.status(403).json({ error: 'This petition has expired' });
      }
    }

    // Check for duplicate signature
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.headers['x-real-ip'] || '';
    const existing = await pool.query(
      'SELECT id FROM petition_signatures WHERE email = $1 AND petition_name = $2',
      [email.toLowerCase(), petition_name || 'default']
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'This email has already signed this petition' });
    }

    // Generate confirmation token if needed
    const confirmationToken = petition.requires_confirmation 
      ? crypto.randomBytes(32).toString('hex')
      : null;

    // Insert signature
    const signatureResult = await pool.query(
      `INSERT INTO petition_signatures (
        petition_name, full_name, email, zip_code, ip_address,
        street, city, state, country,
        confirmed, confirmation_token, anonymous, optin, custom_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
      RETURNING id, created_at`,
      [
        petition_name || 'default',
        full_name,
        email.toLowerCase(),
        zip_code || null,
        ipAddress,
        street || null,
        city || null,
        state || null,
        country || null,
        !petition.requires_confirmation, // Auto-confirm if confirmation not required
        confirmationToken,
        anonymous || false,
        optin || false,
        JSON.stringify(custom_data || {})
      ]
    );

    const signatureId = signatureResult.rows[0].id;

    // Build custom fields HTML for email
    let customFieldsHtml = '';
    if (custom_data && typeof custom_data === 'object') {
      const customFields = petition.custom_fields || [];
      customFields.forEach(field => {
        if (field.included_in_email && custom_data[field.label]) {
          customFieldsHtml += `<p><strong>${field.label}:</strong> ${custom_data[field.label]}</p>`;
        }
      });
    }

    // Send confirmation email if required
    if (petition.requires_confirmation && confirmationToken) {
      const confirmUrl = `https://securethevotemd.com/api/petition/confirm?token=${confirmationToken}`;
      const confirmHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #9B1E37;">Confirm Your Petition Signature</h2>
          <p>Dear ${full_name},</p>
          <p>Thank you for signing our petition: <strong>${petition.title}</strong></p>
          <p>Please confirm your signature by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmUrl}" style="background: #9B1E37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Confirm My Signature</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${confirmUrl}</p>
          <p style="margin-top: 30px; color: #666; font-size: 12px;">If you did not sign this petition, please ignore this email.</p>
        </div>
      `;
      
      await sendEmail(email, 'Please Confirm Your Petition Signature', confirmHtml);
    }

    // Send petition email to target if enabled and confirmed (or confirmation not required)
    if (petition.sends_email && !petition.requires_confirmation) {
      const messageToSend = petition_message || petition.petition_message || '';
      
      const petitionEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <h2 style="color: #9B1E37;">${petition.email_subject || petition.title}</h2>
          ${petition.greeting ? `<p>${petition.greeting}</p>` : ''}
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-left: 4px solid #9B1E37;">
            ${messageToSend.replace(/\n/g, '<br>')}
          </div>
          <h3>Signer Information:</h3>
          <p><strong>Name:</strong> ${full_name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${zip_code ? `<p><strong>Zip Code:</strong> ${zip_code}</p>` : ''}
          ${street ? `<p><strong>Street:</strong> ${street}</p>` : ''}
          ${city ? `<p><strong>City:</strong> ${city}</p>` : ''}
          ${state ? `<p><strong>State:</strong> ${state}</p>` : ''}
          ${country ? `<p><strong>Country:</strong> ${country}</p>` : ''}
          ${customFieldsHtml}
          <p style="margin-top: 30px; color: #666; font-size: 12px;">
            This petition signature was submitted on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
          </p>
        </div>
      `;

      await sendEmail(
        petition.target_email,
        petition.email_subject || `New Petition Signature: ${petition.title}`,
        petitionEmailHtml,
        petition.target_email_cc,
        petition.bcc_signer ? email : null
      );
    }

    // Send thank you email if enabled
    if (petition.thank_you_email && petition.thank_you_subject && petition.thank_you_content) {
      const thankYouHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${petition.thank_you_content.replace(/\n/g, '<br>')}
        </div>
      `;
      
      await sendEmail(email, petition.thank_you_subject, thankYouHtml);
    }

    // Get updated signature count
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM petition_signatures WHERE petition_name = $1',
      [petition_name || 'default']
    );
    const signatureCount = parseInt(countResult.rows[0].count);

    // Check if goal should auto-increase
    if (petition.goal && petition.goal_auto_increase) {
      const triggerThreshold = petition.goal * (petition.goal_trigger_percent / 100);
      if (signatureCount >= triggerThreshold) {
        const newGoal = Math.ceil(petition.goal * (1 + petition.goal_bump_percent / 100));
        await pool.query(
          'UPDATE petitions SET goal = $1 WHERE id = $2',
          [newGoal, petition.id]
        );
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: petition.requires_confirmation 
        ? 'Please check your email to confirm your signature!'
        : 'Thank you for signing the petition!',
      id: signatureId,
      signature_count: signatureCount,
      goal: petition.goal,
      goal_progress: petition.goal ? Math.min(100, Math.round((signatureCount / petition.goal) * 100)) : null,
      redirect_url: petition.redirect_url
    });

  } catch (error) {
    console.error('Petition error:', error.message);
    return res.status(500).json({ error: 'Failed to process signature' });
  } finally {
    await pool.end().catch(() => {});
  }
};
