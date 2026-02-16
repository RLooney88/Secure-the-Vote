/**
 * Welcome Email Template for New Admin Users
 * 
 * Welcomes new admin users and provides login instructions.
 * 
 * @param {Object} params - Template parameters
 * @param {string} params.name - Admin's name
 * @param {string} params.loginUrl - URL to the admin login page
 * @param {string} [params.supportEmail] - Support email for help
 * @returns {Object} { subject, html, text }
 */
function welcomeAdmin({ name, loginUrl, supportEmail }) {
  const recipientName = name || 'New Admin';
  const loginLink = loginUrl || 'https://www.securethevotemd.com/admin/login';
  const support = supportEmail || 'support@securethevotemd.com';
  
  const subject = `Welcome to SecureTheVoteMD Admin Panel`;
  
  const html = `<p>We're excited to have you join our team!</p>
<p>As an admin, you'll be able to:</p>
<ul style="font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#333;line-height:1.6;margin:15px 0;padding-left:20px;">
  <li>Manage petition campaigns and track signatures</li>
  <li>Review and moderate comments</li>
  <li>Access analytics and reporting</li>
  <li>Communicate with supporters</li>
</ul>
<p>Your admin account has been set up. When you're ready to get started, log in to the admin panel.</p>`;

  const ctaText = 'Log In to Admin Panel';
  const ctaUrl = loginLink;
  
  const footerNote = `If you have any questions, our team is here to help. Just reach out to ${support}.`;

  // Get the wrapped HTML
  const { wrapEmail } = require('./email-template');
  const fullHtml = wrapEmail({
    recipientName,
    subject,
    headline: 'Welcome to the SecureTheVoteMD Team!',
    body: html,
    ctaText,
    ctaUrl,
    footerNote
  });

  const text = `WELCOME TO SECURETHEVOTEMD ADMIN!

Hello ${recipientName},

We're excited to have you join our team!

AS AN ADMIN, YOU CAN:
- Manage petition campaigns and track signatures
- Review and moderate comments  
- Access analytics and reporting
- Communicate with supporters

Your admin account is ready. Log in here: ${loginLink}

Questions? Email us at ${support}.

- The SecureTheVoteMD Team`;

  return { subject, html: fullHtml, text };
}

module.exports = welcomeAdmin;