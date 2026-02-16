/**
 * SecureTheVoteMD - Branded Email Template Wrapper
 * 
 * A reusable email template system that ensures consistent branding across all emails.
 * Uses HTML tables for email client compatibility and inline styles only.
 * 
 * @param {Object} options - Template options
 * @param {string} options.recipientName - Personalized greeting (e.g., "Hi Sarah,")
 * @param {string} options.subject - Used in preheader text
 * @param {string} options.headline - Big text in the header area
 * @param {string} options.body - Main HTML content
 * @param {string} [options.ctaText] - Optional call-to-action button text
 * @param {string} [options.ctaUrl] - Optional CTA button URL
 * @param {string} [options.footerNote] - Optional extra footer text
 * @returns {string} Full HTML email content
 */
function wrapEmail(options) {
  const {
    recipientName = 'Friend',
    subject = '',
    headline = '',
    body = '',
    ctaText = '',
    ctaUrl = '',
    footerNote = ''
  } = options;

  const logoUrl = 'https://www.securethevotemd.com/images/2024/04/LOGOsecurethevote_yellowMD.png';
  const siteUrl = 'https://www.securethevotemd.com';
  const unsubscribeUrl = `${siteUrl}/unsubscribe`;
  const preheaderText = subject || headline;

  // CTA button HTML (only if CTA is provided)
  const ctaButtonHtml = ctaText && ctaUrl ? `
    <tr>
      <td align="center" style="padding: 30px 20px;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 8px; background-color: #F6BF58;">
              <a href="${ctaUrl}" target="_blank" style="font-size: 16px; font-family: Arial, Helvetica, sans-serif; color: #333333; text-decoration: none; padding: 14px 30px; border-radius: 8px; display: inline-block; font-weight: bold;">
                ${ctaText}
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  ` : '';

  // Footer note HTML (only if provided)
  const footerNoteHtml = footerNote ? `
    <tr>
      <td align="center" style="padding: 0 20px 20px;">
        <p style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #666666; margin: 0;">
          ${footerNote}
        </p>
      </td>
    </tr>
  ` : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-formatting" content="">
  <title>${subject || 'SecureTheVoteMD'}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
    
    /* iOS blue link fix */
    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }
    
    /* Gmail blue link fix */
    u + #body a {
      color: inherit;
      text-decoration: none;
      font-size: inherit;
      font-family: inherit;
      font-weight: inherit;
      line-height: inherit;
    }
    
    /* Samsung Mail blue link fix */
    #MessageViewBody a {
      color: inherit;
      text-decoration: none;
      font-size: inherit;
      font-family: inherit;
      font-weight: inherit;
      line-height: inherit;
    }
    
    /* Responsive styles */
    @media screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .mobile-padding {
        padding-left: 15px !important;
        padding-right: 15px !important;
      }
      .mobile-stack {
        display: block !important;
        width: 100% !important;
      }
    }
  </style>
</head>
<body id="body" style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif;">
  <!-- Preheader text (hidden preview text) -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${preheaderText}
     ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌
  </div>

  <!-- Email wrapper table -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        
        <!-- Main email container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- HEADER: Maroon background with logo -->
          <tr>
            <td align="center" style="background-color: #9B1E37; padding: 30px 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <a href="${siteUrl}" target="_blank" style="text-decoration: none;">
                      <img src="${logoUrl}" alt="SecureTheVoteMD" width="200" style="display: block; max-width: 200px; height: auto; border: 0;">
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Gold accent line -->
          <tr>
            <td style="background-color: #F6BF58; height: 4px; font-size: 0; line-height: 0;"> </td>
          </tr>
          
          <!-- BODY: White background with greeting -->
          <tr>
            <td class="mobile-padding" style="padding: 30px 30px 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                
                <!-- Greeting with recipient name -->
                <tr>
                  <td style="padding-bottom: 20px;">
                    <p style="font-family: Arial, Helvetica, sans-serif; font-size: 18px; color: #333333; margin: 0; font-weight: bold;">
                      ${recipientName},
                    </p>
                  </td>
                </tr>
                
                <!-- Headline -->
                <tr>
                  <td style="padding-bottom: 20px;">
                    <h1 style="font-family: Arial, Helvetica, sans-serif; font-size: 24px; color: #9B1E37; margin: 0; font-weight: bold; line-height: 1.3;">
                      ${headline}
                    </h1>
                  </td>
                </tr>
                
                <!-- Body content -->
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: #333333; line-height: 1.6;">
                    ${body}
                  </td>
                </tr>
                
                <!-- CTA Button -->
                ${ctaButtonHtml}
                
              </table>
            </td>
          </tr>
          
          <!-- Footer note (if provided) -->
          ${footerNoteHtml}
          
          <!-- FOOTER: Light gray background -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 25px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                
                <!-- Brand name -->
                <tr>
                  <td align="center" style="padding-bottom: 15px;">
                    <p style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: #9B1E37; margin: 0; font-weight: bold;">
                      SecureTheVoteMD
                    </p>
                  </td>
                </tr>
                
                <!-- Social links placeholders -->
                <tr>
                  <td align="center" style="padding-bottom: 15px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 0 5px;">
                          <span style="color: #666666; font-size: 12px;">[Facebook]</span>
                        </td>
                        <td style="padding: 0 5px;">
                          <span style="color: #666666; font-size: 12px;">[Twitter]</span>
                        </td>
                        <td style="padding: 0 5px;">
                          <span style="color: #666666; font-size: 12px;">[Instagram]</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Unsubscribe -->
                <tr>
                  <td align="center" style="padding-bottom: 15px;">
                    <a href="${unsubscribeUrl}" target="_blank" style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #666666; text-decoration: underline;">
                      Unsubscribe
                    </a>
                  </td>
                </tr>
                
                <!-- Legal text -->
                <tr>
                  <td align="center">
                    <p style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #999999; margin: 0; line-height: 1.4;">
                      You're receiving this because you signed up at securethevotemd.com.<br>
                      Protecting your voting rights and democracy in Maryland.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
          
        </table>
        <!-- End main email container -->
        
        <!-- Spacer for bottom margin -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="height: 40px; font-size: 0; line-height: 0;"> </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>`;

  return html;
}

/**
 * Generate plain text version from HTML body
 * Strips HTML tags and formats for readability
 * 
 * @param {string} html - The HTML content
 * @param {Object} options - Additional options
 * @param {string} options.recipientName - Recipient name for greeting
 * @param {string} options.headline - Headline text
 * @param {string} options.ctaText - CTA button text
 * @param {string} options.ctaUrl - CTA URL
 * @returns {string} Plain text version
 */
function generateTextFromHtml(html, options = {}) {
  // Simple HTML tag stripping
  let text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/ /g, ' ')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/\n\s*\n/g, '\n\n')  // Remove excessive blank lines
    .trim();

  return text;
}

module.exports = { wrapEmail, generateTextFromHtml };