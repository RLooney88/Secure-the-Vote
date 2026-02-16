/**
 * Comment Alert Email Template
 * 
 * Notifies admin of a new comment on a post/petition.
 * 
 * @param {Object} params - Template parameters
 * @param {string} params.adminName - Admin recipient name
 * @param {string} params.postTitle - Title of the post/petition
 * @param {string} params.commentAuthor - Name of the person who commented
 * @param {string} params.commentText - The comment content
 * @param {string} params.postUrl - URL to view the post
 * @param {string} [params.moderationUrl] - URL to moderate the comment
 * @returns {Object} { subject, html, text }
 */
function commentAlert({ adminName, postTitle, commentAuthor, commentText, postUrl, moderationUrl }) {
  const recipientName = adminName || 'Admin';
  const moderateLink = moderationUrl || postUrl;
  
  const subject = `New Comment on "${postTitle}"`;
  
  const html = `<p>A new comment has been posted and may need your attention.</p>
<div style="background:#f9f9f9;border-left:4px solid #9B1E37;padding:15px;margin:15px 0;border-radius:0 4px 4px 0;">
  <p style="margin:0 0 10px;font-weight:bold;color:#333;">
    <em>${commentAuthor} wrote:</em>
  </p>
  <p style="margin:0;color:#555;line-height:1.5;">${commentText}</p>
</div>
<p style="color:#666;font-size:14px;">Please review this comment and take appropriate action.</p>`;

  const ctaText = 'Review Comment';
  const ctaUrl = moderateLink;

  // Get the wrapped HTML
  const { wrapEmail } = require('./email-template');
  const fullHtml = wrapEmail({
    recipientName,
    subject,
    headline: `New Comment on "${postTitle}"`,
    body: html,
    ctaText,
    ctaUrl
  });

  const text = `NEW COMMENT ALERT

Hello ${recipientName},

A new comment has been posted on "${postTitle}".

COMMENT FROM: ${commentAuthor}

"${commentText}"

Please review this comment: ${moderateLink}

- SecureTheVoteMD Admin`;

  return { subject, html: fullHtml, text };
}

module.exports = commentAlert;