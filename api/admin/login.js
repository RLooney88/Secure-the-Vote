// Vercel Serverless Function - Admin Login
const { Pool } = require('pg');
const { generateToken } = require('./_auth.js');
const bcrypt = require('bcryptjs');

// Validate environment variables at module load time
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
}

// Create connection pool using DATABASE_URL from environment
// Optimized for Vercel serverless: minimal pool settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000, // 5 second connection timeout
  idleTimeoutMillis: 10000, // 10 second idle timeout
  max: 1, // Only 1 connection at a time (serverless-friendly)
  allowExitOnIdle: true // Allow process to exit when idle
});

// Handle pool errors gracefully
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check environment variables first
  if (missingEnvVars.length > 0) {
    console.error('Environment check failed - missing:', missingEnvVars);
    return res.status(500).json({ 
      error: 'Server configuration error',
      code: 'MISSING_ENV_VAR'
    });
  }

  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Query admin by email
    let result;
    try {
      result = await pool.query(
        'SELECT id, email, password_hash FROM admins WHERE email = $1',
        [email.toLowerCase()]
      );
    } catch (dbError) {
      console.error('Database query error:', dbError.code, dbError.message);
      if (dbError.code === 'ECONNREFUSED' || dbError.code === 'ENOTFOUND') {
        return res.status(500).json({ 
          error: 'Database connection failed',
          code: 'DB_CONNECTION_ERROR'
        });
      }
      throw dbError; // Let outer catch handle other errors
    }

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, admin.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(admin);

    // Return success with token
    return res.status(200).json({
      success: true,
      token,
      email: admin.email
    });

  } catch (error) {
    console.error('Login error:', error.code || 'unknown', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    
    // Provide specific error codes for common issues
    let errorCode = 'UNKNOWN_ERROR';
    
    // Database connection errors
    if (error.code === 'ECONNREFUSED') errorCode = 'DB_CONNECTION_REFUSED';
    else if (error.code === 'ENOTFOUND') errorCode = 'DB_HOST_NOT_FOUND';
    else if (error.code === '28P01') errorCode = 'DB_AUTH_FAILED';
    else if (error.code === '57P03') errorCode = 'DB_CANNOT_CONNECT';
    else if (error.code === '53300' || error.code === '53302') errorCode = 'DB_TOO_MANY_CONNECTIONS';
    else if (error.code === '42501') errorCode = 'DB_PERMISSION_DENIED';
    else if (error.code === '42P01') errorCode = 'DB_TABLE_NOT_FOUND';
    else if (error.code === '42703') errorCode = 'DB_COLUMN_NOT_FOUND';
    // JWT errors
    else if (error.message && error.message.includes('jwt')) errorCode = 'JWT_ERROR';
    else if (error.name === 'JsonWebTokenError') errorCode = 'JWT_INVALID_TOKEN';
    else if (error.name === 'TokenExpiredError') errorCode = 'JWT_TOKEN_EXPIRED';
    // bcrypt errors
    else if (error.message && error.message.includes('bcrypt')) errorCode = 'BCRYPT_ERROR';
    else if (error.name === 'Error' && error.message.includes('data')) errorCode = 'BCRYPT_DATA_ERROR';
    // Environment errors
    else if (error.message && error.message.includes('environment')) errorCode = 'ENVIRONMENT_ERROR';
    else if (error.message && error.message.includes('not set')) errorCode = 'MISSING_CONFIG';
    
    return res.status(500).json({ 
      error: 'Authentication failed',
      code: errorCode,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    // Close the pool to prevent connection leaks in serverless
    try {
      await pool.end();
    } catch (e) {
      // Ignore errors when closing
    }
  }
};
