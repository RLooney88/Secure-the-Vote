const { requireAuth } = require('../_auth');
const { SITE_ID, SITE_KEY, EDIT_REQUEST_API_URL, EDIT_REQUEST_CALLBACK_AUTH, PUBLIC_SITE_URL } = require('../edit-requests-helpers');
module.exports = async function handler(req, res) {
  try { requireAuth(req); } catch { return res.status(401).json({ error:'Unauthorized' }); }
  return res.status(200).json({ request_api_configured: !!(SITE_KEY && EDIT_REQUEST_API_URL), request_api_url: EDIT_REQUEST_API_URL || null, callback_url: `${PUBLIC_SITE_URL}/api/integrations/edit-requests/callback`, callback_auth_configured: !!EDIT_REQUEST_CALLBACK_AUTH, site_key_configured: !!SITE_KEY, site_id: SITE_ID });
};