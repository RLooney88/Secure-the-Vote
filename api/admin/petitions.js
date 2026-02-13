// API endpoint for petitions management
const { Pool } = require('pg');
const { requireAuth } = require('./_auth.js');

module.exports = async function handler(req, res) {
  const pool = new Pool({
    connectionString: (process.env.DATABASE_URL || '').trim(),
    ssl: { rejectUnauthorized: false },
    max: 1
  });

  try {
    const admin = requireAuth(req);

    if (req.method === 'GET') {
      // List all petitions with signature counts
      const result = await pool.query(`
        SELECT 
          p.*,
          COUNT(ps.id) as signature_count
        FROM petitions p
        LEFT JOIN petition_signatures ps ON p.name = ps.petition_name
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `);

      return res.status(200).json({
        petitions: result.rows
      });

    } else if (req.method === 'POST') {
      // Create new petition
      const { name, title, description, active, fields } = req.body;

      if (!name || !title) {
        return res.status(400).json({ error: 'Name and title are required' });
      }

      // Validate fields is an array
      if (fields && !Array.isArray(fields)) {
        return res.status(400).json({ error: 'Fields must be an array' });
      }

      const result = await pool.query(
        `INSERT INTO petitions (name, title, description, active, fields)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [name, title, description, active !== false, 
         JSON.stringify(fields || ['full_name', 'email', 'zip_code'])]
      );

      return res.status(201).json({
        success: true,
        petition: result.rows[0]
      });

    } else if (req.method === 'PUT') {
      // Update petition
      const petitionId = req.query.id;

      if (!petitionId) {
        return res.status(400).json({ error: 'Petition ID is required' });
      }

      const { name, title, description, active, fields } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const result = await pool.query(
        `UPDATE petitions
         SET name = $1, title = $2, description = $3, active = $4, fields = $5
         WHERE id = $6
         RETURNING *`,
        [name, title, description, active, JSON.stringify(fields), petitionId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Petition not found' });
      }

      return res.status(200).json({
        success: true,
        petition: result.rows[0]
      });

    } else if (req.method === 'DELETE') {
      // Delete/deactivate petition
      const petitionId = req.query.id;

      if (!petitionId) {
        return res.status(400).json({ error: 'Petition ID is required' });
      }

      // Just deactivate instead of delete (preserve signatures)
      const result = await pool.query(
        'UPDATE petitions SET active = false WHERE id = $1 RETURNING *',
        [petitionId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Petition not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Petition deactivated successfully'
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Petitions API error:', error);
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Petition name already exists' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await pool.end().catch(() => {});
  }
};
