/**
 * Password Reset Email Template
 * 
 * Generates branded password reset emails using wrapEmail()
 * 
 * @param {Object} options - Email options
 * @param {string} options.recipientName - Personalized greeting
 * @param {string} options.resetLink - Password reset link
 * @param {string} options.expiresIn - Expiry time display
 * @returns {Object} - { subject, html, text }
 */

const { wrapEmail, generateTextFromHtml } = require('../email-template.js');

function generatePasswordResetEmail(options) {
  const {
    recipientName = 'Admin',
    resetLink = '',
    expiresIn = '30 minutes'
  } = options;

  const subject = 'Password Reset Request - SecureTheVoteMD Admin';
  
  const html = wrapEmail({
    recipientName,
    subject,
    headline: 'Password Reset Request',
    body: `
      <p>We received a request to reset your admin password for SecureTheVoteMD.</p>
      <p>Click the button below to create a new password. This link will expire in <strong>${expiresIn}</strong> for your security.</p>
      <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    `,
    ctaText: 'Reset Your Password',
    ctaUrl: resetLink,
    footerNote: `This reset link will expire in ${expiresIn}. If you need help, please contact support.`
  });

  const text = `Password Reset Request - SecureTheVoteMD Admin

Hello ${recipientName},

We received a request to reset your admin password for SecureTheVoteMD.

To create a new password, visit this link:
${resetLink}

This link will expire in ${expiresIn} for your security.

If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.

---
SecureTheVoteMD - Protecting your voting rights and democracy in Maryland.
`;

  return {
    subject,
    html,
    text
  };
}

module.exports = {
  generatePasswordResetEmail
};