/**
 * Rate limiter for API requests and database operations
 */
const mongoose = require('mongoose');
let redis;
let redisClient;
let getAsync;
let setAsync;
let incrAsync;
let expireAsync;

// Try to require redis, but make it optional
try {
  redis = require('redis');
  
  // Initialize Redis client if Redis URL is provided
  if (process.env.REDIS_URL) {
    redisClient = redis.createClient(process.env.REDIS_URL);
    
    // Promisify Redis methods
    const { promisify } = require('util');
    getAsync = promisify(redisClient.get).bind(redisClient);
    setAsync = promisify(redisClient.set).bind(redisClient);
    incrAsync = promisify(redisClient.incr).bind(redisClient);
    expireAsync = promisify(redisClient.expire).bind(redisClient);
    
    // Handle Redis errors
    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
    });
    
    console.log('Redis client initialized');
  } else {
    console.log('No REDIS_URL provided, using in-memory store for rate limiting');
  }
} catch (err) {
  console.log('Redis not installed, using in-memory store for rate limiting');
}

// In-memory store for rate limiting when Redis is not available
const memoryStore = new Map();

/**
 * API rate limiter middleware
 * Limits requests per IP address
 */
const apiLimiter = (req, res, next) => {
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // limit each IP to 100 requests per windowMs
  
  const ip = req.ip || req.connection.remoteAddress;
  const key = `api:${ip}`;
  
  try {
    // Use in-memory store since Redis is not available
    const now = Date.now();
    
    // Clean up expired entries
    for (const [k, v] of memoryStore.entries()) {
      if (now > v.expires) {
        memoryStore.delete(k);
      }
    }
    
    // Get or create entry
    let entry = memoryStore.get(key);
    
    if (!entry) {
      entry = {
        count: 0,
        expires: now + windowMs
      };
      memoryStore.set(key, entry);
    }
    
    // Increment counter
    entry.count++;
    const current = entry.count;
    
    // Check if over limit
    if (current > maxRequests) {
      return res.status(429).json({
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((entry.expires - now) / 1000)
      });
    }
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current));
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.expires / 1000));
    
    next();
  } catch (err) {
    console.error('Rate limiter error:', err);
    next(); // Continue even if rate limiter fails
  }
};

/**
 * Login rate limiter middleware
 * More strict limits for login attempts
 */
const loginLimiter = (req, res, next) => {
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 10; // limit each IP to 10 login attempts per hour
  
  const ip = req.ip || req.connection.remoteAddress;
  const key = `login:${ip}`;
  
  try {
    // Use in-memory store since Redis is not available
    const now = Date.now();
    
    // Clean up expired entries
    for (const [k, v] of memoryStore.entries()) {
      if (now > v.expires) {
        memoryStore.delete(k);
      }
    }
    
    // Get or create entry
    let entry = memoryStore.get(key);
    
    if (!entry) {
      entry = {
        count: 0,
        expires: now + windowMs
      };
      memoryStore.set(key, entry);
    }
    
    // Increment counter
    entry.count++;
    const current = entry.count;
    
    // Check if over limit
    if (current > maxRequests) {
      return res.status(429).json({
        message: 'Too many login attempts, please try again later',
        retryAfter: Math.ceil((entry.expires - now) / 1000)
      });
    }
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current));
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.expires / 1000));
    
    next();
  } catch (err) {
    console.error('Login rate limiter error:', err);
    next(); // Continue even if rate limiter fails
  }
};

/**
 * Database operation rate limiter
 * @param {Function} operation - Database operation to rate limit
 * @param {String} operationType - Type of operation (read/write)
 * @returns {Function} Rate limited operation
 */
const limitDatabaseOperation = (operation, operationType = 'write') => {
  return async (...args) => {
    const windowMs = 60 * 1000; // 1 minute
    const maxOperations = operationType === 'read' ? 1000 : 100; // Different limits for read/write
    
    const limitKey = `db:${operationType}`;
    
    try {
      // Use in-memory store since Redis is not available
      const now = Date.now();
      
      // Clean up expired entries
      for (const [k, v] of memoryStore.entries()) {
        if (now > v.expires) {
          memoryStore.delete(k);
        }
      }
      
      // Get or create entry
      let entry = memoryStore.get(limitKey);
      
      if (!entry) {
        entry = {
          count: 0,
          expires: now + windowMs
        };
        memoryStore.set(limitKey, entry);
      }
      
      // Increment counter
      entry.count++;
      const current = entry.count;
      
      // Check if over limit
      if (current > maxOperations) {
        throw new Error('Database rate limit exceeded');
      }
      
      // Execute the operation
      return await operation(...args);
    } catch (err) {
      if (err.message === 'Database rate limit exceeded') {
        console.error(`Database ${operationType} operation rate limit exceeded`);
        throw err;
      }
      throw err;
    }
  };
};

/**
 * Database operation rate limiter
 * @param {String} key - Unique key for the operation
 * @param {Function} operation - Database operation to execute
 * @returns {Promise} Result of the operation
 */
const dbLimiter = async (key, operation) => {
  try {
    console.log(`Executing database operation with key: ${key}`);
    // Simply execute the operation for now (no actual rate limiting)
    return await operation();
  } catch (err) {
    console.error(`Database operation error for key ${key}:`, err);
    throw err;
  }
};

module.exports = {
  apiLimiter,
  loginLimiter,
  limitDatabaseOperation,
  dbLimiter
};
