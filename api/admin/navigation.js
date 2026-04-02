const { requireAuth } = require('./_auth');
const { getPool } = require('./edit-requests-helpers');
const { NAVIGATION_SEED, ensureNavigationTable, seedNavigationTable, loadNavigationRows } = require('../../lib/navigation');

module.exports = async function handler(req, res) {
  const pool = getPool();
  try {
    requireAuth(req);

    if (req.method === 'GET' && !pool) {
      return res.status(200).json({ items: NAVIGATION_SEED });
    }

    if (!pool) {
      return res.status(500).json({ error: 'DATABASE_URL is required for navigation writes' });
    }

    await ensureNavigationTable(pool);
    await seedNavigationTable(pool);

    if (req.method === 'GET') {
      const rows = await loadNavigationRows();
      return res.status(200).json({ items: rows });
    }

    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const items = Array.isArray(body.items) ? body.items : [];
      if (!items.length) return res.status(400).json({ error: 'items array is required' });

      for (const item of items) {
        await pool.query(
          `UPDATE navigation_items
           SET label = $2,
               path = $3,
               sort_order = $4,
               is_active = $5,
               include_in_site_requests = $6,
               updated_at = NOW()
           WHERE slug = $1`,
          [item.slug, item.label, item.path, item.sort_order || 0, item.is_active !== false, item.include_in_site_requests !== false]
        );
      }

      if (Array.isArray(body.parentLinks)) {
        for (const link of body.parentLinks) {
          await pool.query(
            `UPDATE navigation_items child
             SET parent_id = parent.id,
                 updated_at = NOW()
             FROM navigation_items parent
             WHERE child.slug = $1 AND parent.slug = $2`,
            [link.slug, link.parent_slug]
          );
        }
      }

      const result = await pool.query(`SELECT id, slug, label, path, parent_id, sort_order, is_active, include_in_site_requests FROM navigation_items ORDER BY sort_order ASC, label ASC`);
      return res.status(200).json({ items: result.rows });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('navigation admin error', error);
    return res.status(error.message === 'Unauthorized' ? 401 : 500).json({ error: error.message || 'Request failed' });
  } finally {
    await pool.end().catch(() => {});
  }
};