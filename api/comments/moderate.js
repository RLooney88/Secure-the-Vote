const { Pool } = require('pg');
const { requireAuth } = require('../admin/_auth.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify authentication
  try {
    requireAuth(req);
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.includes('application/json')) {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }

  const { comment_id, action } = req.body;

  // Validate required fields
  if (!comment_id || !action) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['comment_id', 'action']
    });
  }

  // Validate action
  const validActions = ['approve', 'reject', 'spam', 'delete'];
  if (!validActions.includes(action)) {
    return res.status(400).json({
      error: 'Invalid action',
      valid_actions: validActions
    });
  }

  // Validate comment_id is a number
  const commentId = parseInt(comment_id);
  if (isNaN(commentId) || commentId <= 0) {
    return res.status(400).json({ error: 'Invalid comment_id' });
  }

  const pool = new Pool({
    connectionString: (process.env.DATABASE_URL || '').trim(),
    ssl: { rejectUnauthorized: false },
    max: 1
  });

  try {
    // Check if comment exists
    const checkResult = await pool.query(
      'SELECT id, status FROM comments WHERE id = $1',
      [commentId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Handle deletion
    if (action === 'delete') {
      await pool.query(
        'DELETE FROM comments WHERE id = $1',
        [commentId]
      );

      return res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
        comment_id: commentId,
        action: 'delete'
      });
    }

    // Handle status updates (approve, reject, spam)
    const statusMap = {
      'approve': 'approved',
      'reject': 'rejected',
      'spam': 'spam'
    };

    const newStatus = statusMap[action];

    const updateResult = await pool.query(
      `UPDATE comments 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, status, updated_at`,
      [newStatus, commentId]
    );

    return res.status(200).json({
      success: true,
      message: `Comment ${action}ed successfully`,
      comment_id: commentId,
      action,
      new_status: newStatus,
      updated_at: updateResult.rows[0].updated_at
    });

  } catch (error) {
    console.error('Moderation error:', error.message);
    return res.status(500).json({ error: 'Failed to moderate comment' });
  } finally {
    await pool.end().catch(() => {});
  }
};
