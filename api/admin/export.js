// Vercel Serverless Function - Export Signatures as CSV (Admin)
import pg from 'pg';
import { requireAuth } from './_auth.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const auth = requireAuth(req);

    // Get all signatures
    const result = await pool.query(
      'SELECT petition_name, full_name, email, zip_code, created_at, ip_address FROM petition_signatures ORDER BY created_at DESC'
    );

    // Generate CSV
    const headers = ['Petition', 'Full Name', 'Email', 'Zip Code', 'Created At', 'IP Address'];
    const rows = result.rows.map(row => [
      row.petition_name,
      `"${row.full_name.replace(/"/g, '""')}"`,
      `"${row.email}"`,
      row.zip_code || '',
      row.created_at ? new Date(row.created_at).toISOString() : '',
      row.ip_address || ''
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    // Return CSV file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="signatures-${new Date().toISOString().split('T')[0]}.csv"`);
    return res.status(200).send(csv);

  } catch (error) {
    console.error('Export error:', error);
    
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    return res.status(500).json({ error: 'Failed to export signatures' });
  }
}