const { Pool } = require('pg');
const { requireAuth } = require('./_auth.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const pool = new Pool({ connectionString: (process.env.DATABASE_URL || '').trim(), ssl: { rejectUnauthorized: false }, max: 1 });

  try {
    requireAuth(req);

    // Fix 3: Support petition filter
    const { petition } = req.query;
    let query = 'SELECT petition_name, full_name, email, zip_code, created_at, ip_address FROM petition_signatures';
    const params = [];

    if (petition) {
      query += ' WHERE petition_name = $1';
      params.push(petition);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    const headers = ['Petition', 'Full Name', 'Email', 'Zip Code', 'Created At', 'IP Address'];
    const rows = result.rows.map(row => [
      row.petition_name,
      `"${(row.full_name || '').replace(/"/g, '""')}"`,
      `"${row.email}"`,
      row.zip_code || '',
      row.created_at ? new Date(row.created_at).toISOString() : '',
      row.ip_address || ''
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    const filename = petition ? `signatures-${petition}-${new Date().toISOString().split('T')[0]}.csv` : `signatures-${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
  } catch (error) {
    console.error('Export error:', error.message);
    if (error.message === 'Unauthorized') return res.status(401).json({ error: 'Unauthorized' });
    return res.status(500).json({ error: 'Failed to export signatures' });
  } finally {
    await pool.end().catch(() => {});
  }
};
