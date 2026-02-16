/**
 * Petition Signature Confirmation Email Template
 * 
 * Confirms a user has signed a petition and encourages sharing.
 * 
 * @param {Object} params - Template parameters
 * @param {string} params.name - Signer's name
 * @param {string} params.petitionName - Name of the petition
 * @param {string} params.petitionUrl - URL to view the petition
 * @param {string} [params.shareUrl] - URL to share the petition
 * @returns {Object} { subject, html, text }
 */
function petitionConfirmation({ name, petitionName, petitionUrl, shareUrl }) {
  const recipientName = name || 'Supporter';
  const shareLink = shareUrl || petitionUrl;
  
  const subject = `Thanks for signing "${petitionName}"!`;
  
  const html = `<p>Thank you for adding your voice to this important cause!</p>
<p>Your signature has been recorded and helps us show the breadth of support for this issue in Maryland.</p>
<p><strong>What happens next?</strong></p>
<p>We'll deliver these signatures to the relevant decision-makers and keep you updated on our progress. But we can only succeed if more people see this petition.</p>
<p>Can you help amplify this message by sharing with your network?</p>`;

  const ctaText = 'Share This Petition';
  const ctaUrl = shareLink;
  
  const footerNote = 'Every signature counts toward creating change. Thank you for being part of the SecureTheVoteMD community!';

  // Get the wrapped HTML
  const { wrapEmail } = require('./email-template');
  const fullHtml = wrapEmail({
    recipientName,
    subject,
    headline: `Thanks for Signing "${petitionName}"!`,
    body: html,
    ctaText,
    ctaUrl,
    footerNote
  });

  const text = `THANK YOU FOR SIGNING!

Hello ${recipientName},

Thank you for adding your voice to "${petitionName}"!

Your signature has been recorded and helps show the breadth of support for this issue in Maryland.

WHAT HAPPENS NEXT:
- We'll deliver these signatures to the relevant decision-makers
- We'll keep you updated on our progress
- We can only succeed if more people see this petition

Please help by sharing: ${shareLink}

Thank you for being part of the SecureTheVoteMD community!

- The SecureTheVoteMD Team
${petitionUrl}`;

  return { subject, html: fullHtml, text };
}

module.exports = petitionConfirmation;