const { Pool } = require('pg');

const NAVIGATION_SEED = [
  { slug: 'home', label: 'Home', path: '/', parent_slug: null, sort_order: 10, is_active: true, include_in_site_requests: true },
  { slug: 'accountability', label: 'Accountability', path: '#', parent_slug: null, sort_order: 20, is_active: true, include_in_site_requests: false },
  { slug: 'trump-executive-order', label: 'Trump Executive Order', path: '/pages/trump-executive-order/', parent_slug: 'accountability', sort_order: 10, is_active: true, include_in_site_requests: true },
  { slug: 'board-compliance', label: 'Board Compliance', path: '/pages/board-compliance/', parent_slug: 'accountability', sort_order: 20, is_active: true, include_in_site_requests: true },
  { slug: 'legislation', label: 'Legislation', path: '#', parent_slug: null, sort_order: 30, is_active: true, include_in_site_requests: false },
  { slug: 'voter-id', label: 'Voter ID', path: '/pages/voter-id/', parent_slug: 'legislation', sort_order: 10, is_active: true, include_in_site_requests: true },
  { slug: 'signature-verification', label: 'Signature Verification', path: '/pages/signature-verification/', parent_slug: 'legislation', sort_order: 20, is_active: true, include_in_site_requests: true },
  { slug: 'citizen-action', label: 'Citizen Action', path: '/pages/citizen-action/', parent_slug: null, sort_order: 40, is_active: true, include_in_site_requests: true },
  { slug: 'be-an-election-judge', label: 'Be an Election Judge', path: '/pages/be-an-election-judge/', parent_slug: 'citizen-action', sort_order: 10, is_active: true, include_in_site_requests: true },
  { slug: 'poll-watchers-toolkit', label: 'Poll Watchers Toolkit', path: '/pages/poll-watchers-toolkit/', parent_slug: 'citizen-action', sort_order: 20, is_active: true, include_in_site_requests: true },
  { slug: 'sign-the-petition', label: 'Sign the Petition', path: '/pages/sign-the-petition/', parent_slug: 'citizen-action', sort_order: 30, is_active: true, include_in_site_requests: true },
  { slug: 'resources', label: 'Resources', path: '/pages/resources/', parent_slug: null, sort_order: 50, is_active: true, include_in_site_requests: true },
  { slug: 'in-the-news', label: 'In The News', path: '/pages/in-the-news/', parent_slug: 'resources', sort_order: 10, is_active: true, include_in_site_requests: true },
  { slug: 'whats-happening', label: "What's Happening", path: '/pages/whats-happening/', parent_slug: 'resources', sort_order: 20, is_active: true, include_in_site_requests: true },
  { slug: 'news', label: 'News', path: '#', parent_slug: null, sort_order: 60, is_active: true, include_in_site_requests: false },
  { slug: 'all-news', label: 'All News', path: '/news/', parent_slug: 'news', sort_order: 10, is_active: true, include_in_site_requests: true },
  { slug: 'news-citizen-action', label: 'Citizen Action', path: '/news/citizen-action/', parent_slug: 'news', sort_order: 20, is_active: true, include_in_site_requests: true },
  { slug: 'lawsuit-documents', label: 'Lawsuit Documents', path: '/news/lawsuit-documents/', parent_slug: 'news', sort_order: 30, is_active: true, include_in_site_requests: true },
  { slug: 'score-card', label: 'Score Card', path: '/news/score-card/', parent_slug: 'news', sort_order: 40, is_active: true, include_in_site_requests: true },
  { slug: 'contact-us', label: 'Contact Us', path: '/pages/contact-us/', parent_slug: null, sort_order: 70, is_active: true, include_in_site_requests: true }
];

function getPool() {
  const connectionString = String(process.env.DATABASE_URL || '').trim();
  if (!connectionString) return null;
  return new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 1 });
}

async function ensureNavigationTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS navigation_items (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(120) UNIQUE NOT NULL,
      label VARCHAR(255) NOT NULL,
      path VARCHAR(500) NOT NULL,
      parent_id INTEGER REFERENCES navigation_items(id) ON DELETE SET NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT true,
      include_in_site_requests BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function seedNavigationTable(pool) {
  await ensureNavigationTable(pool);
  for (const item of NAVIGATION_SEED) {
    await pool.query(
      `INSERT INTO navigation_items (slug, label, path, sort_order, is_active, include_in_site_requests)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (slug) DO UPDATE SET
         label = EXCLUDED.label,
         path = EXCLUDED.path,
         sort_order = EXCLUDED.sort_order,
         is_active = EXCLUDED.is_active,
         include_in_site_requests = EXCLUDED.include_in_site_requests,
         updated_at = NOW()`,
      [item.slug, item.label, item.path, item.sort_order, item.is_active, item.include_in_site_requests]
    );
  }

  for (const item of NAVIGATION_SEED.filter(entry => entry.parent_slug)) {
    await pool.query(
      `UPDATE navigation_items child
       SET parent_id = parent.id,
           updated_at = NOW()
       FROM navigation_items parent
       WHERE child.slug = $1
         AND parent.slug = $2
         AND child.parent_id IS DISTINCT FROM parent.id`,
      [item.slug, item.parent_slug]
    );
  }
}

function normalizePath(path) {
  const raw = String(path || '').trim();
  if (!raw) return '/';
  if (raw === '#') return '#';
  let value = raw;
  if (/^https?:\/\//i.test(value)) {
    try {
      value = new URL(value).pathname || '/';
    } catch {
      return raw;
    }
  }
  value = value.replace(/\\/g, '/');
  if (!value.startsWith('/')) value = `/${value}`;
  value = value.replace(/\/+/g, '/');
  if (value !== '/' && !value.endsWith('/')) value += '/';
  return value;
}

function mapSeedRows() {
  const ids = new Map();
  NAVIGATION_SEED.forEach((item, index) => ids.set(item.slug, index + 1));
  return NAVIGATION_SEED.map((item, index) => ({
    id: index + 1,
    slug: item.slug,
    label: item.label,
    path: item.path,
    parent_id: item.parent_slug ? ids.get(item.parent_slug) : null,
    sort_order: item.sort_order,
    is_active: item.is_active,
    include_in_site_requests: item.include_in_site_requests
  }));
}

function buildNavigation(rows, currentUrl = '/') {
  const normalizedCurrentUrl = normalizePath(currentUrl);
  const byId = new Map();
  const items = rows
    .filter(row => row.is_active)
    .sort((a, b) => {
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return a.label.localeCompare(b.label);
    })
    .map(row => {
      const itemPath = row.path === '#' ? '#' : normalizePath(row.path);
      const item = {
        id: row.id,
        slug: row.slug,
        label: row.label,
        path: row.path,
        normalizedPath: itemPath,
        parent_id: row.parent_id,
        sort_order: row.sort_order,
        is_active: row.is_active,
        include_in_site_requests: row.include_in_site_requests,
        children: [],
        isCurrent: itemPath !== '#' && (normalizedCurrentUrl === itemPath || (itemPath !== '/' && normalizedCurrentUrl.startsWith(itemPath))),
        isAncestor: false
      };
      byId.set(item.id, item);
      return item;
    });

  const roots = [];
  for (const item of items) {
    if (item.parent_id && byId.has(item.parent_id)) {
      byId.get(item.parent_id).children.push(item);
    } else {
      roots.push(item);
    }
  }

  const markAncestors = (item) => {
    let childActive = item.isCurrent;
    item.children.forEach(child => {
      if (markAncestors(child)) childActive = true;
    });
    item.isAncestor = childActive && !item.isCurrent;
    item.isActiveTrail = childActive;
    return childActive;
  };

  roots.forEach(markAncestors);

  return {
    items,
    primary: roots,
    siteRequests: items
      .filter(item => item.include_in_site_requests && item.normalizedPath !== '#')
      .map(item => ({ slug: item.slug, label: item.label, path: item.normalizedPath, parent_id: item.parent_id, sort_order: item.sort_order }))
  };
}

async function loadNavigationRows() {
  const pool = getPool();
  if (!pool) return mapSeedRows();
  try {
    await seedNavigationTable(pool);
    const result = await pool.query(`
      SELECT id, slug, label, path, parent_id, sort_order, is_active, include_in_site_requests
      FROM navigation_items
      ORDER BY sort_order ASC, label ASC
    `);
    return result.rows;
  } catch (error) {
    console.warn('Navigation DB unavailable, using seed data:', error.message);
    return mapSeedRows();
  } finally {
    await pool.end().catch(() => {});
  }
}

async function getNavigation(currentUrl = '/') {
  const rows = await loadNavigationRows();
  return buildNavigation(rows, currentUrl);
}

module.exports = {
  NAVIGATION_SEED,
  normalizePath,
  ensureNavigationTable,
  seedNavigationTable,
  loadNavigationRows,
  buildNavigation,
  getNavigation
};