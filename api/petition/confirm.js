// Email confirmation endpoint (public, no auth required)
const { Pool } = require('pg');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pool = new Pool({
    connectionString: (process.env.DATABASE_URL || '').trim(),
    ssl: { rejectUnauthorized: false },
    max: 1
  });

  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Confirmation token is required' });
    }

    // Find signature with this token
    const result = await pool.query(
      `UPDATE petition_signatures 
       SET confirmed = true 
       WHERE confirmation_token = $1 AND confirmed = false
       RETURNING id, petition_name, full_name, email`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Invalid or already confirmed token' 
      });
    }

    const signature = result.rows[0];

    // Return HTML confirmation page
    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Confirmed - SecureTheVote</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #9B1E37 0%, #7A1829 100%);
            color: white;
            margin: 0;
            padding: 40px 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            background: white;
            color: #333;
            border-radius: 12px;
            padding: 40px;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          }
          h1 {
            color: #9B1E37;
            margin: 0 0 20px;
          }
          .checkmark {
            width: 80px;
            height: 80px;
            background: #4CAF50;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 30px;
            font-size: 48px;
          }
          p {
            line-height: 1.6;
            margin: 0 0 20px;
          }
          .btn {
            display: inline-block;
            background: #9B1E37;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 20px;
          }
          .btn:hover {
            background: #7A1829;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="checkmark">✓</div>
          <h1>Email Confirmed!</h1>
          <p>Thank you, <strong>${signature.full_name}</strong>!</p>
          <p>Your signature on the petition has been confirmed and your voice will be heard.</p>
          <a href="/" class="btn">Return to Homepage</a>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Confirmation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await pool.end().catch(() => {});
  }
};
