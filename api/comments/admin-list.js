const { Pool } = require('pg');
const { requireAuth } = require('../admin/_auth.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify authentication
  try {
    requireAuth(req);
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Extract query parameters
  const { status, page = '1', limit = '20' } = req.query;

  // Validate pagination parameters
  let pageNum = parseInt(page);
  let limitNum = parseInt(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    pageNum = 1;
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    limitNum = 20;
  }

  // Validate status filter if provided
  const validStatuses = ['pending', 'approved', 'rejected', 'spam'];
  let statusFilter = null;
  if (status && validStatuses.includes(status)) {
    statusFilter = status;
  }

  const pool = new Pool({
    connectionString: (process.env.DATABASE_URL || '').trim(),
    ssl: { rejectUnauthorized: false },
    max: 1
  });

  try {
    // Calculate offset
    const offset = (pageNum - 1) * limitNum;

    // Build query based on status filter
    let countQuery = 'SELECT COUNT(*) as total FROM comments';
    let dataQuery = `SELECT 
      id, post_slug, author_name, author_email, author_website, content, status, 
      created_at, updated_at, ip_address
      FROM comments`;
    let whereClause = '';
    let params = [];

    if (statusFilter) {
      whereClause = ' WHERE status = $1';
      params = [statusFilter];
    }

    countQuery += whereClause;
    dataQuery += whereClause + ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);

    // Get total count
    const countResult = await pool.query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].total);

    // Get paginated comments
    const dataParams = [...params, limitNum, offset];
    const dataResult = await pool.query(dataQuery, dataParams);

    const comments = dataResult.rows.map(row => ({
      id: row.id,
      post_slug: row.post_slug,
      author_name: row.author_name,
      author_email: row.author_email,
      author_website: row.author_website,
      content: row.content,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      ip_address: row.ip_address
    }));

    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json({
      success: true,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total_count: totalCount,
        total_pages: totalPages,
        has_next: pageNum < totalPages,
        has_prev: pageNum > 1
      },
      status_filter: statusFilter || 'all',
      comments
    });

  } catch (error) {
    console.error('Admin list error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch comments' });
  } finally {
    await pool.end().catch(() => {});
  }
};
