// Vercel Serverless Function - Get Petition Signatures (Admin)
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
    requireAuth(req);

    // Parse query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const petitionName = req.query.petition || null;

    // Build query
    let query = 'SELECT * FROM petition_signatures';
    const params = [];
    
    if (petitionName) {
      query += ' WHERE petition_name = $1';
      params.push(petitionName);
    }
    
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    // Execute query
    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM petition_signatures';
    if (petitionName) {
      countQuery += ' WHERE petition_name = $1';
    }
    const countResult = await pool.query(countQuery, petitionName ? [petitionName] : []);
    const total = parseInt(countResult.rows[0].count);

    // Return signatures
    return res.status(200).json({
      success: true,
      signatures: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Signatures error:', error);
    
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    return res.status(500).json({ error: 'Failed to fetch signatures' });
  }
}