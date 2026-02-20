// API endpoint for single post operations (get, update, delete)
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
    const postId = req.query.id;

    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    if (req.method === 'GET') {
      // Get single post
      const result = await pool.query(
        'SELECT * FROM posts WHERE id = $1',
        [postId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }

      return res.status(200).json({ post: result.rows[0] });

    } else if (req.method === 'PUT') {
      // Update post
      const {
        title,
        slug,
        content,
        excerpt,
        category,
        post_type,
        external_url,
        featured_image,
        seo_title,
        seo_description,
        og_image
      } = req.body;

      if (!title || !slug) {
        return res.status(400).json({ error: 'Title and slug are required' });
      }

      const result = await pool.query(
        `UPDATE posts 
         SET title = $1, slug = $2, content = $3, excerpt = $4, 
             category = $5, post_type = $6, external_url = $7,
             featured_image = $8, seo_title = $9, seo_description = $10, 
             og_image = $11, updated_at = CURRENT_TIMESTAMP
         WHERE id = $12
         RETURNING *`,
        [title, slug, content, excerpt, category, post_type, external_url,
         featured_image, seo_title, seo_description, og_image, postId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }

      return res.status(200).json({
        success: true,
        post: result.rows[0]
      });

    } else if (req.method === 'DELETE') {
      // Get slug before delete so we can clear pending edits for this post path
      const pre = await pool.query('SELECT slug FROM posts WHERE id = $1', [postId]);
      if (pre.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      const slug = pre.rows[0].slug;

      // Delete post
      await pool.query('DELETE FROM posts WHERE id = $1', [postId]);

      // Best-effort cleanup of pending edits for this slug
      const siteBuilderDb = (process.env.SITE_BUILDER_DATABASE_URL || process.env.DATABASE_URL || '').trim();
      if (siteBuilderDb) {
        const sbPool = new Pool({
          connectionString: siteBuilderDb,
          ssl: { rejectUnauthorized: false },
          max: 1
        });
        try {
          await sbPool.query(
            `DELETE FROM pending_edits
             WHERE site_id = 'securethevotemd'
               AND status = 'pending'
               AND file_path LIKE $1`,
            [`dist/%/${slug}/index.html`]
          );
        } catch (cleanupErr) {
          console.warn('Pending edit cleanup warning:', cleanupErr.message);
        } finally {
          await sbPool.end().catch(() => {});
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Post deleted successfully'
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Post API error:', error);
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await pool.end().catch(() => {});
  }
};
