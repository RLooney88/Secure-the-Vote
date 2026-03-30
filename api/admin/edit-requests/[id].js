const { requireAuth } = require('../_auth');
const { getPool, ensureTable, triggerReviewAction } = require('../edit-requests-helpers');
module.exports = async function handler(req, res) {
  const pool = getPool();
  try {
    const admin = requireAuth(req);
    await ensureTable(pool);
    const id = req.query.id;
    const result = await pool.query('SELECT * FROM edit_requests WHERE id=$1', [id]);
    if (!result.rows.length) return res.status(404).json({ error:'Edit request not found' });
    const row = result.rows[0];
    if (req.method === 'GET') return res.status(200).json(row);
    const action = req.query.action;
    const history = Array.isArray(row.history) ? row.history : [];
    if (req.method === 'PUT' && action === 'close') { history.push({ action:'closed', timestamp:new Date().toISOString(), user:admin.email||admin.id }); await pool.query('UPDATE edit_requests SET status=$2, history=$3, updated_at=NOW() WHERE id=$1',[id,'closed',JSON.stringify(history)]); return res.status(200).json({ message:'Request closed' }); }
    if (req.method === 'PUT' && action === 'reopen') { history.push({ action:'reopened', timestamp:new Date().toISOString(), user:admin.email||admin.id }); await pool.query('UPDATE edit_requests SET status=$2, history=$3, updated_at=NOW() WHERE id=$1',[id,'open',JSON.stringify(history)]); return res.status(200).json({ message:'Request reopened' }); }
    if (req.method === 'PUT' && (action === 'approve' || action === 'request-revision')) {
      const payload = row.callback_payload || {}; const url = action === 'approve' ? payload.approvePublishLink : payload.requestChangesLink; const review = await triggerReviewAction(url); history.push({ action, timestamp:new Date().toISOString(), user:admin.email||admin.id, result:review }); await pool.query('UPDATE edit_requests SET history=$2, updated_at=NOW() WHERE id=$1',[id,JSON.stringify(history)]); return res.status(200).json({ message:'Review action submitted', result:review }); }
    return res.status(405).json({ error:'Method not allowed' });
  } catch (error) { console.error('edit request detail error', error); return res.status(error.message==='Unauthorized'?401:500).json({ error:error.message||'Failed' }); } finally { await pool.end().catch(()=>{}); }
};