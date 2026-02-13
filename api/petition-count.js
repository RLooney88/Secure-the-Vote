// Vercel Serverless Function - Get Petition Count
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const count = await kv.get('petition:count') || 0;
    
    return res.status(200).json({ 
      count,
      success: true
    });
  } catch (error) {
    console.error('Error fetching petition count:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch count',
      message: error.message 
    });
  }
}
