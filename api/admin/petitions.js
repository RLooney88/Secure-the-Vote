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
      const {
        name, title, description, active, fields,
        target_email, target_email_cc, email_subject, greeting, petition_message,
        goal, goal_auto_increase, goal_bump_percent, goal_trigger_percent,
        sends_email, requires_confirmation, display_message, message_editable,
        allow_anonymous, show_signature_list, signature_privacy, social_sharing,
        optin_enabled, optin_label, bcc_signer,
        thank_you_email, thank_you_subject, thank_you_content,
        redirect_url, expires, expiration_date, custom_fields
      } = req.body;

      if (!name || !title) {
        return res.status(400).json({ error: 'Name and title are required' });
      }

      // Validate fields is an array
      if (fields && !Array.isArray(fields)) {
        return res.status(400).json({ error: 'Fields must be an array' });
      }

      // Validate custom_fields is an array
      if (custom_fields && !Array.isArray(custom_fields)) {
        return res.status(400).json({ error: 'Custom fields must be an array' });
      }

      const result = await pool.query(
        `INSERT INTO petitions (
          name, title, description, active, fields,
          target_email, target_email_cc, email_subject, greeting, petition_message,
          goal, goal_auto_increase, goal_bump_percent, goal_trigger_percent,
          sends_email, requires_confirmation, display_message, message_editable,
          allow_anonymous, show_signature_list, signature_privacy, social_sharing,
          optin_enabled, optin_label, bcc_signer,
          thank_you_email, thank_you_subject, thank_you_content,
          redirect_url, expires, expiration_date, custom_fields, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, 'draft')
         RETURNING *`,
        [
          name, title, description, active !== false,
          JSON.stringify(fields || ['full_name', 'email', 'zip_code']),
          target_email || null, target_email_cc || null, email_subject || null,
          greeting || null, petition_message || null,
          goal || null, goal_auto_increase || false,
          goal_bump_percent || 25, goal_trigger_percent || 90,
          sends_email !== false, requires_confirmation || false,
          display_message !== false, message_editable || false,
          allow_anonymous || false, show_signature_list !== false,
          signature_privacy || 'first_initial', social_sharing !== false,
          optin_enabled || false, optin_label || 'Add me to your mailing list',
          bcc_signer || false,
          thank_you_email || false, thank_you_subject || null, thank_you_content || null,
          redirect_url || null, expires || false,
          expiration_date || null, JSON.stringify(custom_fields || [])
        ]
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

      const {
        name, title, description, active, fields,
        target_email, target_email_cc, email_subject, greeting, petition_message,
        goal, goal_auto_increase, goal_bump_percent, goal_trigger_percent,
        sends_email, requires_confirmation, display_message, message_editable,
        allow_anonymous, show_signature_list, signature_privacy, social_sharing,
        optin_enabled, optin_label, bcc_signer,
        thank_you_email, thank_you_subject, thank_you_content,
        redirect_url, expires, expiration_date, custom_fields
      } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const result = await pool.query(
        `UPDATE petitions SET
          name = $1, title = $2, description = $3, active = $4, fields = $5,
          target_email = $6, target_email_cc = $7, email_subject = $8,
          greeting = $9, petition_message = $10,
          goal = $11, goal_auto_increase = $12, goal_bump_percent = $13,
          goal_trigger_percent = $14, sends_email = $15, requires_confirmation = $16,
          display_message = $17, message_editable = $18, allow_anonymous = $19,
          show_signature_list = $20, signature_privacy = $21, social_sharing = $22,
          optin_enabled = $23, optin_label = $24, bcc_signer = $25,
          thank_you_email = $26, thank_you_subject = $27, thank_you_content = $28,
          redirect_url = $29, expires = $30, expiration_date = $31, custom_fields = $32
         WHERE id = $33
         RETURNING *`,
        [
          name, title, description, active,
          JSON.stringify(fields),
          target_email, target_email_cc, email_subject, greeting, petition_message,
          goal, goal_auto_increase, goal_bump_percent, goal_trigger_percent,
          sends_email, requires_confirmation, display_message, message_editable,
          allow_anonymous, show_signature_list, signature_privacy, social_sharing,
          optin_enabled, optin_label, bcc_signer,
          thank_you_email, thank_you_subject, thank_you_content,
          redirect_url, expires, expiration_date,
          JSON.stringify(custom_fields || []),
          petitionId
        ]
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
