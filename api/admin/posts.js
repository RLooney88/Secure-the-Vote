// API endpoint for blog posts (list and create)
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
      // List posts with pagination and filters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      const category = req.query.category || '';
      const status = req.query.status || '';
      const search = req.query.search || '';

      let whereConditions = [];
      let params = [];
      let paramIndex = 1;

      if (category) {
        whereConditions.push(`category = $${paramIndex++}`);
        params.push(category);
      }

      if (status) {
        whereConditions.push(`status = $${paramIndex++}`);
        params.push(status);
      }

      if (search) {
        whereConditions.push(`(title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`);
        params.push(`%${search}%`);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 
        ? 'WHERE ' + whereConditions.join(' AND ')
        : '';

      // Get total count
      const countResult = await pool.query(
        `SELECT COUNT(*) FROM posts ${whereClause}`,
        params
      );
      const total = parseInt(countResult.rows[0].count);

      // Get posts
      const result = await pool.query(
        `SELECT * FROM posts ${whereClause} 
         ORDER BY created_at DESC 
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...params, limit, offset]
      );

      return res.status(200).json({
        posts: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });

    } else if (req.method === 'POST') {
      // Create new post
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
        `INSERT INTO posts 
         (title, slug, content, excerpt, category, post_type, external_url, 
          featured_image, seo_title, seo_description, og_image, author_email, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'draft')
         RETURNING *`,
        [title, slug, content, excerpt, category || 'uncategorized', 
         post_type || 'article', external_url, featured_image, 
         seo_title, seo_description, og_image, admin.email]
      );

      return res.status(201).json({
        success: true,
        post: result.rows[0]
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Posts API error:', error);
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Slug already exists' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await pool.end().catch(() => {});
  }
};
