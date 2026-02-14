// Public petition view endpoint (no auth required)
const { Pool } = require('pg');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pool = new Pool({
    connectionString: (process.env.DATABASE_URL || '').trim(),
    ssl: { rejectUnauthorized: false },
    max: 1
  });

  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: 'Petition name is required' });
    }

    // Get petition details
    const petitionResult = await pool.query(
      `SELECT 
        id, name, title, description, active,
        petition_message, display_message, message_editable,
        goal, custom_fields, expires, expiration_date,
        allow_anonymous, optin_enabled, optin_label,
        redirect_url, social_sharing, fields
       FROM petitions
       WHERE name = $1`,
      [name]
    );

    if (petitionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Petition not found' });
    }

    const petition = petitionResult.rows[0];

    // Check if petition is active
    if (!petition.active) {
      return res.status(403).json({ error: 'This petition is not currently active' });
    }

    // Check if expired
    if (petition.expires && petition.expiration_date) {
      const expirationDate = new Date(petition.expiration_date);
      if (expirationDate < new Date()) {
        return res.status(403).json({ error: 'This petition has expired' });
      }
    }

    // Get signature count
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM petition_signatures WHERE petition_name = $1',
      [name]
    );

    const signatureCount = parseInt(countResult.rows[0].count);

    return res.status(200).json({
      petition: {
        id: petition.id,
        name: petition.name,
        title: petition.title,
        description: petition.description,
        message: petition.display_message ? petition.petition_message : null,
        message_editable: petition.message_editable,
        goal: petition.goal,
        custom_fields: petition.custom_fields || [],
        allow_anonymous: petition.allow_anonymous,
        optin_enabled: petition.optin_enabled,
        optin_label: petition.optin_label,
        redirect_url: petition.redirect_url,
        social_sharing: petition.social_sharing,
        fields: petition.fields || ['full_name', 'email', 'zip_code']
      },
      signature_count: signatureCount,
      goal_progress: petition.goal ? Math.min(100, Math.round((signatureCount / petition.goal) * 100)) : null
    });

  } catch (error) {
    console.error('Petition view error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await pool.end().catch(() => {});
  }
};
