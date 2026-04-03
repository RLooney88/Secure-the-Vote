const path = require('path');
const crypto = require('crypto');
const { Storage } = require('@google-cloud/storage');

const MEDIA_BUCKET = process.env.MEDIA_GCS_BUCKET || process.env.SITE_EDIT_GCS_BUCKET || 'site-edit-assets';
const MEDIA_PREFIX = (process.env.MEDIA_GCS_PREFIX || 'securethevotemd/media').replace(/^\/+|\/+$/g, '');
const MEDIA_PUBLIC_BASE_URL = (process.env.MEDIA_PUBLIC_BASE_URL || `https://storage.googleapis.com/${MEDIA_BUCKET}`).replace(/\/$/, '');
const GCS_SERVICE_ACCOUNT_JSON = process.env.GCS_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '';
const UPLOAD_MAX_BYTES = parseInt(process.env.MEDIA_UPLOAD_MAX_BYTES || `${25 * 1024 * 1024}`, 10);
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']);

function parseServiceAccountJson(value) {
  if (!value) {
    throw new Error('Missing GCS service account configuration');
  }

  if (typeof value === 'object') {
    return value;
  }

  const raw = String(value).trim();
  const candidates = [];

  candidates.push(raw);

  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    candidates.push(raw.slice(1, -1));
  }

  for (const candidate of [...candidates]) {
    candidates.push(candidate.replace(/\\n/g, '\n'));
    candidates.push(candidate.replace(/\r\n/g, '\n'));
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch (_) {}
  }

  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf8').trim();
    if (decoded && decoded !== raw) {
      return JSON.parse(decoded);
    }
  } catch (_) {}

  throw new Error('Invalid GCS service account configuration format');
}

function getStorage() {
  const creds = parseServiceAccountJson(GCS_SERVICE_ACCOUNT_JSON);

  return new Storage({
    projectId: creds.project_id,
    credentials: creds
  });
}

function getBucket() {
  return getStorage().bucket(MEDIA_BUCKET);
}

function sanitizeSegment(value) {
  return String(value || '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/(^\/+|\/+?$)/g, '')
    .split('/')
    .map((segment) => segment.replace(/[^a-zA-Z0-9._-]+/g, '-'))
    .filter(Boolean)
    .join('/');
}

function safeFilename(filename, fallbackExt = '.bin') {
  const parsed = path.parse(String(filename || 'upload'));
  const name = parsed.name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'upload';
  const ext = (parsed.ext || fallbackExt).toLowerCase();
  return `${name}${ext}`;
}

function inferExtension(filename, mimeType) {
  const ext = (path.extname(String(filename || '')) || '').toLowerCase();
  if (ext) return ext;
  const byType = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg'
  };
  return byType[mimeType] || '.bin';
}

function normalizeFolder(folder) {
  return sanitizeSegment(folder);
}

function buildObjectPath({ folder = '', filename, mimeType }) {
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const ext = inferExtension(filename, mimeType);
  const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const baseFolder = normalizeFolder(folder) || `${year}/${month}`;
  const sanitized = safeFilename(filename, ext);
  const parsed = path.parse(sanitized);
  const finalName = `${parsed.name}-${uniqueSuffix}${parsed.ext || ext}`;
  return `${MEDIA_PREFIX}/${baseFolder}/${finalName}`;
}

function objectPathToPublicUrl(objectPath) {
  const normalized = String(objectPath || '').replace(/^\/+/, '');
  return `${MEDIA_PUBLIC_BASE_URL}/${normalized}`;
}

function toRelativeMediaPath(objectPath) {
  const normalized = String(objectPath || '').replace(/^\/+/, '');
  if (!normalized.startsWith(`${MEDIA_PREFIX}/`)) return normalized;
  return normalized.slice(MEDIA_PREFIX.length + 1);
}

module.exports = {
  MEDIA_BUCKET,
  MEDIA_PREFIX,
  MEDIA_PUBLIC_BASE_URL,
  UPLOAD_MAX_BYTES,
  ALLOWED_TYPES,
  getBucket,
  buildObjectPath,
  objectPathToPublicUrl,
  toRelativeMediaPath,
  normalizeFolder
};
