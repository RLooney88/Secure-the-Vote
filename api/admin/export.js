const { Pool } = require('pg');
const { requireAuth } = require('./_auth.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const pool = new Pool({ connectionString: (process.env.DATABASE_URL || '').trim(), ssl: { rejectUnauthorized: false }, max: 1 });

  try {
    requireAuth(req);

    const result = await pool.query(
      'SELECT petition_name, full_name, email, zip_code, created_at, ip_address FROM petition_signatures ORDER BY created_at DESC'
    );

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
    res.setHeader('Content-Disposition', `attachment; filename="signatures-${new Date().toISOString().split('T')[0]}.csv"`);
    return res.status(200).send(csv);
  } catch (error) {
    console.error('Export error:', error.message);
    if (error.message === 'Unauthorized') return res.status(401).json({ error: 'Unauthorized' });
    return res.status(500).json({ error: 'Failed to export signatures' });
  } finally {
    await pool.end().catch(() => {});
  }
};
