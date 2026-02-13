// JWT Authentication utilities for admin endpoints
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Generate JWT token
export function generateToken(admin) {
  return jwt.sign(
    { id: admin.id, email: admin.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Extract token from Authorization header
export function extractToken(authHeader) {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  return parts[1];
}

// Check if request is authenticated
export function requireAuth(req) {
  const token = extractToken(req.headers.authorization);
  const decoded = verifyToken(token);
  
  if (!decoded) {
    throw new Error('Unauthorized');
  }
  
  return decoded;
}