// Proxy endpoint for checking Vercel deployment status
// Avoids CORS issues with direct Vercel API calls from browser

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
  const PROJECT_ID = 'prj_ToDYtaNFY2C3qT8vWrDPvoxIebn5';
  
  if (!VERCEL_TOKEN) {
    return res.status(500).json({ error: 'VERCEL_TOKEN not configured' });
  }

  const target = req.query.target || 'preview';
  
  try {
    const response = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${PROJECT_ID}&target=${target}&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.message || 'Vercel API error' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
