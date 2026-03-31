const { requireAuth } = require('./_auth');
const {
  UPLOAD_MAX_BYTES,
  ALLOWED_TYPES,
  getBucket,
  buildObjectPath,
  objectPathToPublicUrl,
  normalizeFolder
} = require('./_mediaStorage');

let bucketCorsApplied = false;

function setCors(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type');
}

async function ensureBucketCors(bucket) {
  if (bucketCorsApplied) return;
  try {
    await bucket.setCorsConfiguration([
      {
        origin: ['*'],
        method: ['PUT', 'OPTIONS'],
        responseHeader: ['Content-Type', 'x-goog-acl'],
        maxAgeSeconds: 3600
      }
    ]);
    bucketCorsApplied = true;
  } catch (error) {
    console.warn('Unable to update media bucket CORS automatically:', error.message);
  }
}

module.exports = async (req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    requireAuth(req);
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (_) {
      body = null;
    }
  }

  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Expected JSON body with upload metadata' });
  }

  const action = String(body.action || 'init').toLowerCase();

  try {
    const bucket = getBucket();

    if (action === 'init') {
      const filename = String(body.filename || '').trim();
      const mimeType = String(body.mimeType || '').trim().toLowerCase();
      const size = Number(body.size || 0);
      const folder = normalizeFolder(body.folder || '');

      if (!filename) {
        return res.status(400).json({ error: 'Filename is required' });
      }

      if (!ALLOWED_TYPES.has(mimeType)) {
        return res.status(400).json({ error: 'Invalid file type. Allowed: jpg, png, gif, webp, svg' });
      }

      if (!Number.isFinite(size) || size <= 0) {
        return res.status(400).json({ error: 'File size is required' });
      }

      if (size > UPLOAD_MAX_BYTES) {
        return res.status(400).json({ error: `File too large. Maximum size: ${Math.round(UPLOAD_MAX_BYTES / (1024 * 1024))}MB` });
      }

      await ensureBucketCors(bucket);

      const objectPath = buildObjectPath({ folder, filename, mimeType });
      const file = bucket.file(objectPath);

      const [uploadUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000,
        contentType: mimeType,
        extensionHeaders: {
          'x-goog-acl': 'public-read'
        }
      });

      return res.status(200).json({
        success: true,
        uploadUrl,
        method: 'PUT',
        headers: {
          'Content-Type': mimeType,
          'x-goog-acl': 'public-read'
        },
        objectPath,
        folder,
        maxSize: UPLOAD_MAX_BYTES,
        publicUrl: objectPathToPublicUrl(objectPath)
      });
    }

    if (action === 'complete') {
      const objectPath = String(body.objectPath || '').replace(/^\/+/, '');
      if (!objectPath) {
        return res.status(400).json({ error: 'objectPath is required' });
      }

      const file = bucket.file(objectPath);
      const [exists] = await file.exists();
      if (!exists) {
        return res.status(404).json({ error: 'Uploaded file not found in storage' });
      }

      // makePublic() works on Fine-Grained ACL buckets; it throws on Uniform
      // Bucket-Level Access buckets. In the UBA case the bucket-level IAM
      // policy (allUsers: objectViewer) is what grants public read, so the
      // object is already publicly accessible after upload.
      try {
        await file.makePublic();
      } catch (aclErr) {
        console.warn('makePublic skipped (likely UBA bucket, non-fatal):', aclErr.message);
      }
      const [metadata] = await file.getMetadata();
      const filename = objectPath.split('/').pop();
      const url = objectPathToPublicUrl(objectPath);

      return res.status(200).json({
        success: true,
        url,
        filename,
        objectPath,
        folder: objectPath.split('/').slice(0, -1).join('/'),
        publicUrl: url,
        size: Number(metadata.size || 0),
        contentType: metadata.contentType || null
      });
    }

    return res.status(400).json({ error: 'Unsupported upload action' });
  } catch (error) {
    console.error('Upload image error:', error);
    return res.status(500).json({ error: `Failed to process upload: ${error.message}` });
  }
};
