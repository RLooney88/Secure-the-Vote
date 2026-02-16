// api/admin/upload-image.js
const busboy = require('busboy');
const { requireAuth } = require('./_auth');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'RLooney88';
const REPO = 'Secure-the-Vote';
const BRANCH = 'development';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify authentication
  try {
    requireAuth(req);
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check for GitHub token
  if (!GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Parse multipart form data
  const bb = busboy({ headers: req.headers });
  let fileData = null;
  let filename = null;
  let mimeType = null;
  let fileSize = 0;

  bb.on('file', (fieldname, file, info) => {
    const { filename: originalFilename, mimeType: fileMimeType } = info;
    
    // Validate file type
    if (!ALLOWED_TYPES.includes(fileMimeType)) {
      file.resume();
      return res.status(400).json({ 
        error: 'Invalid file type. Allowed: jpg, png, gif, webp' 
      });
    }

    mimeType = fileMimeType;
    const ext = originalFilename.split('.').pop();
    
    // Generate unique filename: timestamp + random + extension
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    filename = `${timestamp}-${random}.${ext}`;

    const chunks = [];
    
    file.on('data', (chunk) => {
      fileSize += chunk.length;
      
      // Check size limit
      if (fileSize > MAX_SIZE) {
        file.resume();
        return res.status(400).json({ 
          error: 'File too large. Maximum size: 5MB' 
        });
      }
      
      chunks.push(chunk);
    });

    file.on('end', () => {
      fileData = Buffer.concat(chunks);
    });
  });

  bb.on('finish', async () => {
    if (!fileData) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      // Generate path: /images/blog/YYYY/MM/filename
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const path = `images/blog/${year}/${month}/${filename}`;

      // Upload to GitHub using Contents API
      const uploadUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
      
      const uploadPayload = {
        message: `Upload image: ${filename}`,
        content: fileData.toString('base64'),
        branch: BRANCH
      };

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'User-Agent': 'SecureTheVote-Admin'
        },
        body: JSON.stringify(uploadPayload)
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        console.error('GitHub upload error:', errorData);
        return res.status(500).json({ 
          error: 'Failed to upload image to repository' 
        });
      }

      const uploadData = await uploadResponse.json();
      
      // Return the path that can be used in the site
      const imageUrl = `/${path}`;
      
      res.status(200).json({
        success: true,
        url: imageUrl,
        path: path,
        filename: filename
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        error: 'Failed to upload image: ' + error.message 
      });
    }
  });

  bb.on('error', (error) => {
    console.error('Busboy error:', error);
    res.status(500).json({ error: 'Upload processing error' });
  });

  req.pipe(bb);
};
