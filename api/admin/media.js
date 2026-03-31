const { requireAuth } = require('./_auth');
const {
  getBucket,
  MEDIA_PREFIX,
  objectPathToPublicUrl,
  toRelativeMediaPath,
  normalizeFolder
} = require('./_mediaStorage');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'RLooney88';
const REPO = 'Secure-the-Vote';
const BRANCH = 'main';
const REPO_IMAGES_PREFIX = 'dist/images/';
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']);

function isImagePath(filePath) {
  const lower = String(filePath || '').toLowerCase();
  return Array.from(ALLOWED_EXTENSIONS).some((ext) => lower.endsWith(ext));
}

function toRepoMediaItem(item) {
  const relativePath = item.path.replace(REPO_IMAGES_PREFIX, '');
  return {
    source: 'repo',
    path: relativePath,
    name: relativePath.split('/').pop(),
    url: `/${item.path.replace(/^dist\//, '')}`,
    size: item.size || 0,
    updatedAt: null
  };
}

function toGcsMediaItem(file, metadataMap) {
  const relativePath = toRelativeMediaPath(file.name);
  const metadata = metadataMap.get(file.name) || {};
  return {
    source: 'gcs',
    path: relativePath,
    name: relativePath.split('/').pop(),
    url: objectPathToPublicUrl(file.name),
    size: Number(metadata.size || 0),
    updatedAt: metadata.updated || metadata.timeCreated || null
  };
}

async function loadRepoImages() {
  if (!GITHUB_TOKEN) return [];

  const url = `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${BRANCH}?recursive=1`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'SecureTheVote-Admin'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to load repo media: ${errorText}`);
  }

  const data = await response.json();
  return (data.tree || [])
    .filter((item) => item.type === 'blob' && item.path && item.path.startsWith(REPO_IMAGES_PREFIX) && isImagePath(item.path))
    .map(toRepoMediaItem);
}

async function loadGcsImages() {
  try {
    const bucket = getBucket();
    const [files] = await bucket.getFiles({ prefix: `${MEDIA_PREFIX}/` });
    const imageFiles = files.filter((file) => isImagePath(file.name));
    const metadataMap = new Map();

    await Promise.all(imageFiles.map(async (file) => {
      try {
        const [metadata] = await file.getMetadata();
        metadataMap.set(file.name, metadata || {});
      } catch (_) {
        metadataMap.set(file.name, {});
      }
    }));

    return imageFiles.map((file) => toGcsMediaItem(file, metadataMap));
  } catch (error) {
    console.warn('GCS media library unavailable:', error.message);
    return [];
  }
}

function buildFolderView(images, selectedFolder, search, limit) {
  const normalizedFolder = normalizeFolder(selectedFolder || '');
  const searchTerm = String(search || '').trim().toLowerCase();

  const searchable = images.filter((item) => !searchTerm || item.path.toLowerCase().includes(searchTerm));
  const folderPrefix = normalizedFolder ? `${normalizedFolder}/` : '';
  const inFolder = searchable.filter((item) => {
    if (!normalizedFolder) return true;
    return item.path === normalizedFolder || item.path.startsWith(folderPrefix);
  });

  const folderMap = new Map();
  const imageItems = [];

  for (const item of inFolder) {
    const remaining = normalizedFolder ? item.path.slice(folderPrefix.length) : item.path;
    const segments = remaining.split('/').filter(Boolean);
    if (segments.length > 1) {
      const childFolder = normalizedFolder ? `${normalizedFolder}/${segments[0]}` : segments[0];
      if (!folderMap.has(childFolder)) {
        folderMap.set(childFolder, {
          path: childFolder,
          name: segments[0],
          previewUrl: item.url,
          imageCount: 0
        });
      }
      folderMap.get(childFolder).imageCount += 1;
      continue;
    }

    imageItems.push(item);
  }

  const folders = Array.from(folderMap.values()).sort((a, b) => a.path.localeCompare(b.path));
  const sortedImages = imageItems
    .sort((a, b) => {
      const aTime = a.updatedAt ? Date.parse(a.updatedAt) : 0;
      const bTime = b.updatedAt ? Date.parse(b.updatedAt) : 0;
      return bTime - aTime || a.path.localeCompare(b.path);
    })
    .slice(0, limit);

  const breadcrumbs = [];
  if (normalizedFolder) {
    const parts = normalizedFolder.split('/');
    let acc = '';
    for (const part of parts) {
      acc = acc ? `${acc}/${part}` : part;
      breadcrumbs.push({ name: part, path: acc });
    }
  }

  return {
    currentFolder: normalizedFolder,
    breadcrumbs,
    folders,
    images: sortedImages,
    count: searchable.length
  };
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

  try {
    const limit = Math.min(parseInt(req.query?.limit || '250', 10) || 250, 500);
    const folder = req.query?.folder || '';
    const search = req.query?.search || '';

    const [repoImages, gcsImages] = await Promise.all([
      loadRepoImages(),
      loadGcsImages()
    ]);

    const merged = [...gcsImages, ...repoImages];
    const view = buildFolderView(merged, folder, search, limit);
    return res.status(200).json(view);
  } catch (error) {
    console.error('Media library error:', error);
    return res.status(500).json({ error: `Failed to load media library: ${error.message}` });
  }
};
