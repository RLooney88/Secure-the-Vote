// Vercel Serverless Function - View All Petition Signatures (Admin Only)
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Simple admin auth - check for secret key in header or query
    const adminKey = req.headers['x-admin-key'] || req.query.key;
    const validAdminKey = process.env.ADMIN_SECRET_KEY;

    if (!adminKey || adminKey !== validAdminKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    // Fetch signatures from list
    const signatures = await kv.lrange('petition:signatures', start, end);
    const totalCount = await kv.get('petition:count') || 0;

    // Parse JSON strings
    const parsedSignatures = signatures.map(sig => JSON.parse(sig));

    return res.status(200).json({
      success: true,
      data: parsedSignatures,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Admin view error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch signatures',
      message: error.message 
    });
  }
}
