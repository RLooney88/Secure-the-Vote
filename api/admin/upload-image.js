const Busboy = require('busboy');
const { requireAuth } = require('./_auth');

module.exports.config = {
  api: {
    bodyParser: false
  }
};
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

function isMultipartRequest(req) {
  const contentType = String(req.headers['content-type'] || '').toLowerCase();
  return contentType.includes('multipart/form-data');
}

async function ensureBucketCors(bucket) {
  if (bucketCorsApplied) return;
  try {
    await bucket.setCorsConfiguration([
      {
        origin: ['*'],
        method: ['PUT', 'OPTIONS'],
        responseHeader: ['Content-Type'],
        maxAgeSeconds: 3600
      }
    ]);
    bucketCorsApplied = true;
  } catch (error) {
    console.warn('Unable to update media bucket CORS automatically:', error.message);
  }
}

async function parseMultipartUpload(req) {
  return new Promise((resolve, reject) => {
    const bb = Busboy({ headers: req.headers, limits: { fileSize: UPLOAD_MAX_BYTES, files: 1, fields: 10 } });
    const fields = {};
    let upload = null;
    let completed = false;

    bb.on('field', (name, value) => {
      fields[name] = typeof value === 'string' ? value : String(value || '');
    });

    bb.on('file', (name, file, info) => {
      const filename = String(info?.filename || '').trim();
      const mimeType = String(info?.mimeType || '').trim().toLowerCase();
      const chunks = [];
      let totalBytes = 0;
      let limitHit = false;

      file.on('data', (chunk) => {
        totalBytes += chunk.length;
        chunks.push(chunk);
      });

      file.on('limit', () => {
        limitHit = true;
      });

      file.on('end', () => {
        if (!filename) return;
        upload = {
          fieldName: name,
          filename,
          mimeType,
          size: totalBytes,
          buffer: Buffer.concat(chunks)
        };

        if (limitHit) {
          reject(new Error(`File too large. Maximum size: ${Math.round(UPLOAD_MAX_BYTES / (1024 * 1024))}MB`));
        }
      });
    });

    bb.on('error', reject);
    bb.on('finish', () => {
      if (completed) return;
      completed = true;
      resolve({ fields, upload });
    });

    req.pipe(bb);
  });
}

async function handleDirectMultipartUpload(req, res, bucket) {
  const { fields, upload } = await parseMultipartUpload(req);
  const folder = normalizeFolder(fields.folder || '');

  if (!upload) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  if (!ALLOWED_TYPES.has(upload.mimeType)) {
    return res.status(400).json({ error: 'Invalid file type. Allowed: jpg, png, gif, webp, svg' });
  }

  if (!Number.isFinite(upload.size) || upload.size <= 0) {
    return res.status(400).json({ error: 'File size is required' });
  }

  if (upload.size > UPLOAD_MAX_BYTES) {
    return res.status(400).json({ error: `File too large. Maximum size: ${Math.round(UPLOAD_MAX_BYTES / (1024 * 1024))}MB` });
  }

  const objectPath = buildObjectPath({ folder, filename: upload.filename, mimeType: upload.mimeType });
  const file = bucket.file(objectPath);

  await file.save(upload.buffer, {
    resumable: false,
    metadata: {
      contentType: upload.mimeType,
      cacheControl: 'public, max-age=31536000, immutable'
    }
  });

  try {
    await file.makePublic();
  } catch (aclErr) {
    console.warn('Direct upload makePublic skipped/non-fatal:', aclErr.message);
  }

  let metadata = null;
  try {
    const [fmeta] = await file.getMetadata();
    metadata = fmeta;
  } catch (metaErr) {
    console.warn('Direct upload metadata lookup skipped/non-fatal:', metaErr.message);
  }

  const url = objectPathToPublicUrl(objectPath);

  return res.status(200).json({
    success: true,
    mode: 'direct',
    url,
    filename: objectPath.split('/').pop(),
    objectPath,
    folder,
    publicUrl: url,
    size: Number((metadata && metadata.size) || upload.size || 0),
    contentType: (metadata && metadata.contentType) || upload.mimeType
  });
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

  try {
    const bucket = getBucket();

    if (isMultipartRequest(req)) {
      return await handleDirectMultipartUpload(req, res, bucket);
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
      return res.status(400).json({ error: 'Expected JSON body with upload metadata or multipart/form-data upload' });
    }

    const action = String(body.action || 'init').toLowerCase();

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
        contentType: mimeType
      });

      return res.status(200).json({
        success: true,
        uploadUrl,
        method: 'PUT',
        headers: {
          'Content-Type': mimeType
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
