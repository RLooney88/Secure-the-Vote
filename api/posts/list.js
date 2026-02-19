// api/posts/list.js - Public endpoint for blog posts
const { Pool } = require('pg');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const pool = new Pool({
    connectionString: (process.env.DATABASE_URL || '').trim(),
    ssl: { rejectUnauthorized: false },
    max: 1
  });

  try {
    const { limit = '9', offset = '0' } = req.query;
    const limitNum = Math.min(parseInt(limit, 10) || 9, 50);
    const offsetNum = parseInt(offset, 10) || 0;

    const result = await pool.query(
      `SELECT id, title, slug, excerpt, category, featured_image, published_at, url
       FROM posts
       WHERE status = 'published'
       ORDER BY published_at DESC
       LIMIT $1 OFFSET $2`,
      [limitNum, offsetNum]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM posts WHERE status = 'published'`
    );

    return res.status(200).json({
      posts: result.rows,
      total: parseInt(countResult.rows[0].total, 10),
      limit: limitNum,
      offset: offsetNum
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({ error: 'Failed to fetch posts' });
  } finally {
    await pool.end();
  }
};
