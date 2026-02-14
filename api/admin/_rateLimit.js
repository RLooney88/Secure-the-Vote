/**
 * Simple in-memory rate limiter for Vercel serverless functions
 * 
 * NOTE: This is NOT production-grade rate limiting because serverless functions
 * are stateless and this Map will be reset on each cold start. For production,
 * use one of the following:
 * 
 * 1. Vercel Edge Middleware with KV storage
 * 2. Upstash Redis for serverless rate limiting
 * 3. A third-party WAF (Web Application Firewall)
 * 
 * This implementation provides basic protection against simple attacks
 * but should be upgraded for production use.
 */

const rateLimitStore = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.resetTime > 0) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check rate limit for a given identifier (IP address, email, etc.)
 * @param {string} identifier - Unique identifier for the client
 * @param {number} maxAttempts - Maximum attempts allowed in the window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Object} - { allowed: boolean, remaining: number, resetTime: number }
 */
function checkRateLimit(identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const key = `ratelimit:${identifier}`;
  
  let entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired one
    entry = {
      count: 0,
      resetTime: now + windowMs
    };
  }
  
  entry.count++;
  rateLimitStore.set(key, entry);
  
  const allowed = entry.count <= maxAttempts;
  const remaining = Math.max(0, maxAttempts - entry.count);
  
  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
    retryAfter: Math.ceil((entry.resetTime - now) / 1000) // seconds
  };
}

/**
 * Add rate limit headers to response
 * @param {Object} res - Response object
 * @param {number} limit - Rate limit
 * @param {number} remaining - Remaining attempts
 * @param {number} resetTime - Unix timestamp when limit resets
 */
function addRateLimitHeaders(res, limit, remaining, resetTime) {
  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', Math.floor(resetTime / 1000));
}

/**
 * Middleware to enforce rate limiting on endpoints
 * @param {string} identifier - Unique identifier for the client
 * @param {Object} options - { maxAttempts, windowMs }
 * @returns {Object|null} - Null if allowed, error response object if rate limited
 */
function enforceRateLimit(identifier, options = {}) {
  const maxAttempts = options.maxAttempts || 10;
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes default
  
  const result = checkRateLimit(identifier, maxAttempts, windowMs);
  
  if (!result.allowed) {
    return {
      status: 429,
      headers: {
        'X-RateLimit-Limit': maxAttempts,
        'X-RateLimit-Remaining': result.remaining,
        'X-RateLimit-Reset': Math.floor(result.resetTime / 1000),
        'Retry-After': result.retryAfter
      },
      body: {
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
        retryAfter: result.retryAfter
      }
    };
  }
  
  return null;
}

module.exports = {
  checkRateLimit,
  addRateLimitHeaders,
  enforceRateLimit
};
