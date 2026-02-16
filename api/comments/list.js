const { Pool } = require('pg');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract post slug from query params
  const { post } = req.query;

  if (!post) {
    return res.status(400).json({
      error: 'Missing required query parameter',
      required: ['post']
    });
  }

  // Validate post slug format
  if (typeof post !== 'string' || post.length === 0 || post.length > 500) {
    return res.status(400).json({ error: 'Invalid post slug' });
  }

  const pool = new Pool({
    connectionString: (process.env.DATABASE_URL || '').trim(),
    ssl: { rejectUnauthorized: false },
    max: 1
  });

  try {
    // Fetch only approved comments for the given post
    const result = await pool.query(
      `SELECT 
        id,
        author_name,
        content,
        created_at
      FROM comments
      WHERE post_slug = $1 AND status = $2
      ORDER BY created_at ASC`,
      [post, 'approved']
    );

    const comments = result.rows.map(row => ({
      id: row.id,
      author_name: row.author_name,
      content: row.content,
      created_at: row.created_at
    }));

    return res.status(200).json({
      success: true,
      post_slug: post,
      count: comments.length,
      comments
    });

  } catch (error) {
    console.error('Comment list error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch comments' });
  } finally {
    await pool.end().catch(() => {});
  }
};
