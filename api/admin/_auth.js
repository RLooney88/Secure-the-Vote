// JWT Authentication utilities for admin endpoints
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('CRITICAL: JWT_SECRET environment variable is not set!');
  console.error('Admin authentication will fail until this is configured.');
}

// Generate JWT token
function generateToken(admin) {
  if (!JWT_SECRET) {
    const error = new Error('JWT_SECRET not configured');
    error.code = 'JWT_SECRET_MISSING';
    throw error;
  }
  
  return jwt.sign(
    { id: admin.id, email: admin.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Extract token from Authorization header
function extractToken(authHeader) {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  return parts[1];
}

// Check if request is authenticated
function requireAuth(req) {
  const token = extractToken(req.headers.authorization);
  const decoded = verifyToken(token);
  
  if (!decoded) {
    throw new Error('Unauthorized');
  }
  
  return decoded;
}

module.exports = {
  generateToken,
  verifyToken,
  extractToken,
  requireAuth
};
