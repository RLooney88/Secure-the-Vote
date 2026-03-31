const { requireAuth } = require('./_auth');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'RLooney88';
const REPO = 'Secure-the-Vote';
const BRANCH = 'main';
const IMAGES_PREFIX = 'dist/images/';
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']);

function isImagePath(path) {
  const lower = String(path || '').toLowerCase();
  return Array.from(ALLOWED_EXTENSIONS).some((ext) => lower.endsWith(ext));
}

function toPublicUrl(path) {
  return `/${String(path || '').replace(/^dist\//, '')}`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    requireAuth(req);
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const url = `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${BRANCH}?recursive=1`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'SecureTheVote-Admin'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Media tree fetch failed:', errorText);
      return res.status(500).json({ error: 'Failed to load media library' });
    }

    const data = await response.json();
    const limit = Math.min(parseInt(req.query?.limit || '200', 10) || 200, 500);
    const search = String(req.query?.search || '').trim().toLowerCase();

    const images = (data.tree || [])
      .filter((item) => item.type === 'blob' && item.path && item.path.startsWith(IMAGES_PREFIX) && isImagePath(item.path))
      .filter((item) => !search || item.path.toLowerCase().includes(search))
      .sort((a, b) => b.path.localeCompare(a.path))
      .slice(0, limit)
      .map((item) => ({
        path: item.path,
        name: item.path.split('/').pop(),
        url: toPublicUrl(item.path),
        size: item.size || 0,
        sha: item.sha
      }));

    return res.status(200).json({
      images,
      count: images.length
    });
  } catch (error) {
    console.error('Media library error:', error);
    return res.status(500).json({ error: 'Failed to load media library' });
  }
};
