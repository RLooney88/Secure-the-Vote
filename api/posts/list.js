// api/posts/list.js - Public endpoint for blog posts
import { Pool } from '@vercel/postgres';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = '9', offset = '0' } = req.query;
    const limitNum = parseInt(limit, 10);
    const offsetNum = parseInt(offset, 10);

    const pool = new Pool({
      connectionString: 'postgresql://postgres:xuDFleLFzoWrKvuMjcNCqFEuIjZAMriR@crossover.proxy.rlwy.net:37736/railway'
    });

    const result = await pool.query(
      `SELECT id, title, slug, excerpt, category, featured_image, published_at 
       FROM posts 
       WHERE status = 'published' AND post_type = 'blog'
       ORDER BY published_at DESC 
       LIMIT $1 OFFSET $2`,
      [limitNum, offsetNum]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM posts WHERE status = 'published' AND post_type = 'blog'`
    );

    await pool.end();

    return res.status(200).json({
      posts: result.rows,
      total: parseInt(countResult.rows[0].total, 10),
      limit: limitNum,
      offset: offsetNum
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({ error: 'Failed to fetch posts' });
  }
}
