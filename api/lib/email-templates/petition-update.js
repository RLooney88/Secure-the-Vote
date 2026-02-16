/**
 * Petition Milestone Update Email Template
 * 
 * Celebrates a petition reaching a milestone signature count.
 * 
 * @param {Object} params - Template parameters
 * @param {string} params.name - Recipient's name
 * @param {string} params.petitionName - Name of the petition
 * @param {string} params.milestone - Milestone description (e.g., "10,000")
 * @param {number} params.signatureCount - Current signature count
 * @param {string} params.petitionUrl - URL to view the petition
 * @param {string} [params.nextGoal] - Next milestone to reach
 * @returns {Object} { subject, html, text }
 */
function petitionUpdate({ name, petitionName, milestone, signatureCount, petitionUrl, nextGoal }) {
  const recipientName = name || 'Supporter';
  const nextMilestone = nextGoal || 'the next goal';
  
  const subject = `🎉 "${petitionName}" Just Hit ${milestone} Signatures!`;
  
  const html = `<p>Great news! The petition you signed just reached a major milestone.</p>
<div style="background:#F6BF58;border-radius:8px;padding:25px;text-align:center;margin:20px 0;">
  <p style="font-family:Arial,Helvetica,sans-serif;font-size:18px;color:#333;margin:0 0 10px;font-weight:bold;">
    ${petitionName}
  </p>
  <p style="font-family:Arial,Helvetica,sans-serif;font-size:42px;color:#9B1E37;margin:0;font-weight:bold;">
    ${milestone}
  </p>
  <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#333;margin:10px 0 0;">
    signatures and counting!
  </p>
</div>
<p>Your signature helped make this happen. Together, we're making our voices heard!</p>
<p>Let's keep the momentum going and reach ${nextMilestone}. Share this petition with friends and family who care about voting rights.</p>`;

  const ctaText = 'View Petition & Share';
  const ctaUrl = petitionUrl;

  // Get the wrapped HTML
  const { wrapEmail } = require('./email-template');
  const fullHtml = wrapEmail({
    recipientName,
    subject,
    headline: `🎉 ${milestone} Signatures!`,
    body: html,
    ctaText,
    ctaUrl
  });

  const text = `🎉 MILESTONE REACHED!

Hello ${recipientName},

Great news! "${petitionName}" just hit ${milestone} signatures!

CURRENT COUNT: ${signatureCount} signatures

Your signature helped make this happen. Together, we're making our voices heard!

Let's keep the momentum going and reach ${nextMilestone}. Share this petition with others who care about voting rights.

View and share: ${petitionUrl}

- The SecureTheVoteMD Team`;

  return { subject, html: fullHtml, text };
}

module.exports = petitionUpdate;