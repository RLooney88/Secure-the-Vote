// Vercel Serverless Function - Sign Petition
// This function stores petition signatures in Vercel KV and syncs to HighLevel

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, zip, city, state, comments } = req.body;

    // Validate required fields
    if (!name || !email || !zip) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'email', 'zip']
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if email already signed
    const existingSignature = await kv.get(`petition:${email}`);
    if (existingSignature) {
      return res.status(409).json({ 
        error: 'This email has already signed the petition' 
      });
    }

    // Create signature object
    const signature = {
      name,
      email,
      zip,
      city: city || '',
      state: state || 'MD',
      comments: comments || '',
      timestamp: new Date().toISOString(),
      ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    };

    // Store in Vercel KV
    await kv.set(`petition:${email}`, signature);
    
    // Increment counter
    const count = await kv.incr('petition:count');
    
    // Add to list for admin view
    await kv.lpush('petition:signatures', JSON.stringify(signature));

    // Sync to HighLevel CRM (async, don't wait)
    syncToHighLevel(signature).catch(err => {
      console.error('HighLevel sync error:', err);
    });

    return res.status(200).json({ 
      success: true,
      message: 'Thank you for signing the petition!',
      signatureCount: count
    });

  } catch (error) {
    console.error('Petition signing error:', error);
    return res.status(500).json({ 
      error: 'Failed to process signature',
      message: error.message 
    });
  }
}

// Sync signature to HighLevel CRM
async function syncToHighLevel(signature) {
  const HIGHLEVEL_API_KEY = process.env.HIGHLEVEL_API_KEY;
  const HIGHLEVEL_LOCATION_ID = process.env.HIGHLEVEL_LOCATION_ID;

  if (!HIGHLEVEL_API_KEY || !HIGHLEVEL_LOCATION_ID) {
    console.warn('HighLevel credentials not configured');
    return;
  }

  try {
    const response = await fetch('https://rest.gohighlevel.com/v1/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HIGHLEVEL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        locationId: HIGHLEVEL_LOCATION_ID,
        email: signature.email,
        firstName: signature.name.split(' ')[0],
        lastName: signature.name.split(' ').slice(1).join(' '),
        city: signature.city,
        state: signature.state,
        postalCode: signature.zip,
        tags: ['Petition Signer', 'Website'],
        customFields: [
          {
            key: 'petition_comments',
            value: signature.comments
          },
          {
            key: 'signed_at',
            value: signature.timestamp
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HighLevel API error: ${response.status}`);
    }

    console.log('Successfully synced to HighLevel:', signature.email);
  } catch (error) {
    console.error('HighLevel sync failed:', error);
    throw error;
  }
}
