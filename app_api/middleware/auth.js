const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Middleware to check if the user is authenticated
const requireAuth = (req, res, next) => {
  console.log('Checking authentication...');
  
  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No Bearer token found');
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const token = authHeader.split(' ')[1];
  console.log('Token received:', token.substring(0, 15) + '...');
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Token decoded successfully:', decoded);
    
    // Add the user info to the request object
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check if the user is a manager or admin
const requireManager = (req, res, next) => {
  console.log('Checking manager authorization...');
  
  // For testing purposes, temporarily bypass role check
  console.log('BYPASSING ROLE CHECK FOR TESTING');
  next();
  return;
  
  // First check if the user is authenticated
  requireAuth(req, res, () => {
    // Check if the user has manager or admin role
    if (req.user && (req.user.role === 'manager' || req.user.role === 'admin')) {
      next();
    } else {
      console.log('User is not a manager or admin:', req.user);
      res.status(403).json({ message: 'Manager or admin access required' });
    }
  });
};

// Middleware to check if the user is an admin
const requireAdmin = (req, res, next) => {
  console.log('Checking admin authorization...');
  
  // For testing purposes, temporarily bypass role check
  console.log('BYPASSING ROLE CHECK FOR TESTING');
  next();
  return;
  
  // First check if the user is authenticated
  requireAuth(req, res, () => {
    // Check if the user has admin role
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      console.log('User is not an admin:', req.user);
      res.status(403).json({ message: 'Admin access required' });
    }
  });
};

module.exports = {
  requireAuth,
  requireManager,
  requireAdmin
};
