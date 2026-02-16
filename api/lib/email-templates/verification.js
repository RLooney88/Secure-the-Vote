/**
 * Login Verification Email Template
 * 
 * Sends a verification code for admin login authentication.
 * 
 * @param {Object} params - Template parameters
 * @param {string} params.email - Recipient email address
 * @param {string} params.code - 6-digit verification code
 * @param {number} [params.expiresIn=15] - Minutes until code expires
 * @returns {Object} { subject, html, text }
 */
function verificationEmail({ email, code, expiresIn = 15 }) {
  const recipientName = email.split('@')[0] || 'Admin';
  
  const subject = `Your SecureTheVoteMD Verification Code`;
  
  const html = `<p>Your verification code is:</p>
<div style="background:#f5f5f5;padding:20px;text-align:center;font-size:32px;letter-spacing:8px;font-weight:bold;margin:20px 0;border-radius:8px;color:#333;">${code}</div>
<p style="color:#666;font-size:14px;">This code expires in ${expiresIn} minutes. If you didn't request this, please ignore this email.</p>`;

  const text = `SECURETHEVOTEMD - VERIFICATION CODE

Hello ${recipientName},

Your verification code is: ${code}

This code expires in ${expiresIn} minutes.

If you didn't request this email, please ignore it.

- The SecureTheVoteMD Team`;

  return { subject, html, text };
}

module.exports = verificationEmail;