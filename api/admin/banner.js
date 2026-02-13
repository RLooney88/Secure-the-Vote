// API endpoint for banner slides management
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
      // Get all slides and settings
      const slidesResult = await pool.query(
        'SELECT * FROM banner_slides ORDER BY sort_order ASC'
      );

      const settingsResult = await pool.query(
        "SELECT value FROM site_settings WHERE key = 'banner_enabled'"
      );

      const bannerEnabled = settingsResult.rows.length > 0 
        ? settingsResult.rows[0].value === 'true'
        : true;

      return res.status(200).json({
        slides: slidesResult.rows,
        bannerEnabled
      });

    } else if (req.method === 'POST') {
      // Create new slide
      const {
        title,
        description,
        link_url,
        link_text,
        background_image,
        sort_order,
        active
      } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const result = await pool.query(
        `INSERT INTO banner_slides 
         (title, description, link_url, link_text, background_image, sort_order, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [title, description, link_url, link_text || 'Discover more', 
         background_image, sort_order || 0, active !== false]
      );

      return res.status(201).json({
        success: true,
        slide: result.rows[0]
      });

    } else if (req.method === 'PUT') {
      // Update slide
      const slideId = req.query.id;
      
      if (!slideId) {
        return res.status(400).json({ error: 'Slide ID is required' });
      }

      const {
        title,
        description,
        link_url,
        link_text,
        background_image,
        sort_order,
        active
      } = req.body;

      const result = await pool.query(
        `UPDATE banner_slides 
         SET title = $1, description = $2, link_url = $3, link_text = $4,
             background_image = $5, sort_order = $6, active = $7
         WHERE id = $8
         RETURNING *`,
        [title, description, link_url, link_text, background_image, 
         sort_order, active, slideId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Slide not found' });
      }

      return res.status(200).json({
        success: true,
        slide: result.rows[0]
      });

    } else if (req.method === 'DELETE') {
      // Delete slide
      const slideId = req.query.id;
      
      if (!slideId) {
        return res.status(400).json({ error: 'Slide ID is required' });
      }

      const result = await pool.query(
        'DELETE FROM banner_slides WHERE id = $1 RETURNING id',
        [slideId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Slide not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Slide deleted successfully'
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Banner API error:', error);
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await pool.end().catch(() => {});
  }
};
