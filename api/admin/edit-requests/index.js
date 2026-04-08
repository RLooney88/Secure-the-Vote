const { requireAuth } = require('../_auth');
const { getPool, ensureTable } = require('../edit-requests-helpers');
module.exports = async function handler(req, res) {
  const pool = getPool();
  try {
    requireAuth(req);
    await ensureTable(pool);
    if (req.method === 'GET') {
      const status = (req.query.status || '').trim();
      const result = status
        ? await pool.query('SELECT * FROM edit_requests WHERE status = $1 ORDER BY created_at DESC', [status])
        : await pool.query('SELECT * FROM edit_requests ORDER BY created_at DESC');
      return res.status(200).json(result.rows);
    }
    if (req.method === 'POST') {
      const admin = requireAuth(req);
      const { SITE_ID, SITE_KEY, callbackUrl, sendToNova, splitAssets, uploadAttachmentsToGcs, uuid, PUBLIC_SITE_URL } = require('../edit-requests-helpers');
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      if (!body.title || !body.description) return res.status(400).json({ error: 'title and description are required' });
      const clientRequestId = uuid();
      const storedAttachments = await uploadAttachmentsToGcs(clientRequestId, body.attachments || []);
      const insert = await pool.query(
        `INSERT INTO edit_requests (client_request_id,title,page,description,requester_email,attachments,preview_approval_needed,status,history)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'open',$8) RETURNING *`,
        [clientRequestId, body.title, body.page || '', body.description, body.requester_email || '', JSON.stringify(storedAttachments), body.preview_approval_needed !== false, JSON.stringify([{ action: 'created', timestamp: new Date().toISOString(), user: admin.email || admin.id }])]
      );
      const row = insert.rows[0];
      const { images, files } = splitAssets(storedAttachments);
      let apiResponse = null;
      try {
        apiResponse = await sendToNova({ siteId:SITE_ID, siteKey:SITE_KEY, clientRequestId, requestType:'new_edit', submitter:{ name: admin.email || 'Admin', email: body.requester_email || admin.email || 'admin@securethevotemd.com' }, clientName:'Secure the Vote', website:PUBLIC_SITE_URL, pageRequested:body.page || '', title:body.title, description:body.description, approvalRequired: body.preview_approval_needed !== false, images, attachments:files, meta:{ siteId:SITE_ID, source:'securethevote-backend-admin', callbackUrl: callbackUrl(req) } });
        await pool.query('UPDATE edit_requests SET api_response=$2, updated_at=NOW() WHERE id=$1', [row.id, JSON.stringify(apiResponse)]);
      } catch (e) {
        await pool.query(`UPDATE edit_requests SET api_response=$2, status='blocked', history = history || $3::jsonb, updated_at=NOW() WHERE id=$1`, [row.id, JSON.stringify({ error: e.message }), JSON.stringify([{ action: 'dispatch_failed', timestamp: new Date().toISOString(), error: e.message }])]);
      }
      const refreshed = await pool.query('SELECT * FROM edit_requests WHERE id=$1', [row.id]);
      return res.status(200).json(refreshed.rows[0]);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('edit-requests error', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return res.status(status).json({
      error: error.message || 'Request failed',
      where: 'api/admin/edit-requests',
      name: error.name || 'Error',
      stack: process.env.NODE_ENV !== 'production' ? (error.stack || null) : null
    });
  } finally { await pool.end().catch(() => {}); }
};
