const { getPool, ensureTable, EDIT_REQUEST_CALLBACK_AUTH } = require('../../admin/edit-requests-helpers');
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error:'Method not allowed' });
  const auth = req.headers['x-callback-auth'];
  if (!EDIT_REQUEST_CALLBACK_AUTH || auth !== EDIT_REQUEST_CALLBACK_AUTH) return res.status(401).json({ error:'Invalid callback auth' });
  const pool = getPool();
  try {
    await ensureTable(pool);
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const result = await pool.query('SELECT * FROM edit_requests WHERE client_request_id=$1',[body.clientRequestId]);
    if (!result.rows.length) return res.status(404).json({ error:'Edit request not found' });
    const row = result.rows[0];
    const history = Array.isArray(row.history) ? row.history : [];
    history.push({ action:'callback_received', timestamp:new Date().toISOString(), status:body.status, summary:body.summary, previewLink:body.previewLink, deliverableLink:body.deliverableLink, reviewLink:body.reviewLink, approvePublishLink:body.approvePublishLink, requestChangesLink:body.requestChangesLink, blockedReason:body.blockedReason });
    const map = { completed:'completed', approved:'approved', ready_for_review:'ready_for_review', pending_approval:'pending_approval', revision_requested:'revision_requested', blocked:'blocked', queued:'queued', dispatched:'in_progress', working:'in_progress', in_progress:'in_progress' };
    const status = map[(body.status || '').toLowerCase()] || row.status;
    await pool.query('UPDATE edit_requests SET status=$2, callback_status=$3, callback_received_at=NOW(), callback_payload=$4, history=$5, updated_at=NOW() WHERE id=$1',[row.id,status,body.status||null,JSON.stringify(body),JSON.stringify(history)]);
    return res.status(200).json({ ok:true });
  } catch (error) { console.error('callback error', error); return res.status(500).json({ error:error.message||'Failed callback' }); } finally { await pool.end().catch(()=>{}); }
};