const mongoose = require('mongoose');
const User = mongoose.model('User');
const { handleError } = require('../utils/errorHandler');
const { dbLimiter } = require('../utils/rateLimiter');

/**
 * POST /api/register
 * Register a new user
 */
const register = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.email || !req.body.name || !req.body.password) {
      return res.status(400).json({
        message: 'All fields required'
      });
    }
    
    // Create and save user with rate limiting
    const token = await dbLimiter('users:register', async () => {
      // Create new user
      const user = new User();
      user.name = req.body.name;
      user.email = req.body.email;
      user.setPassword(req.body.password);
      
      // Add optional fields if provided
      if (req.body.phoneNumber) user.phoneNumber = req.body.phoneNumber;
      if (req.body.address) user.address = req.body.address;
      
      // Save user
      await user.save();
      
      // Generate JWT
      return user.generateJwt();
    });
    
    // Return token
    res.status(201).json({
      token
    });
  } catch (err) {
    handleError(err, res, 'register');
  }
};

/**
 * POST /api/login
 * Login a user
 */
const login = async (req, res) => {
  try {
    console.log('Login attempt received:', { email: req.body.email });
    
    // Validate required fields
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        message: 'All fields required'
      });
    }
    
    // Check MongoDB connection state
    const connectionState = mongoose.connection.readyState;
    console.log(`MongoDB connection state: ${connectionState}`);
    
    if (connectionState !== 1) {
      console.log('MongoDB not connected, attempting to reconnect...');
      try {
        await mongoose.connect('mongodb://127.0.0.1/travlr', {
          serverSelectionTimeoutMS: 5000
        });
        console.log('Reconnected to MongoDB');
      } catch (connErr) {
        console.error('Failed to reconnect to MongoDB:', connErr);
        return res.status(500).json({
          message: 'Database connection error, please try again later'
        });
      }
    }
    
    // Find user by email
    console.log('Finding user...');
    let user;
    
    try {
      // Use a simple try/catch instead of the dbLimiter
      user = await User.findOne({ email: req.body.email }).exec();
      console.log('User found:', user ? 'Yes' : 'No');
    } catch (dbErr) {
      console.error('Database query error:', dbErr);
      return res.status(500).json({
        message: 'Database error, please try again later'
      });
    }
    
    // If no user found or password doesn't match
    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }
    
    // Check password
    if (!user.validPassword(req.body.password)) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    const token = user.generateJwt();
    
    // Return token
    return res.status(200).json({
      token
    });
  } catch (err) {
    console.error('Login error details:', err);
    return res.status(500).json({
      message: 'Authentication failed, please try again later'
    });
  }
};

/**
 * GET /api/profile
 * Get user profile
 */
const getProfile = async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthorized'
      });
    }
    
    // Find user by ID with rate limiting
    const user = await dbLimiter(`users:profile:${req.user._id}`, async () => {
      return User.findById(req.user._id).exec();
    });
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    
    // Return sanitized user object
    res.status(200).json(user.toSafeObject());
  } catch (err) {
    handleError(err, res, 'getProfile');
  }
};

/**
 * GET /api/users
 * Get all users (admin only)
 */
const getUsers = async (req, res) => {
  try {
    // Find all users with rate limiting
    const users = await dbLimiter('users:list', async () => {
      return User.find().exec();
    });
    
    // Sanitize user data
    const safeUsers = users.map(user => user.toSafeObject());
    
    res.status(200).json(safeUsers);
  } catch (err) {
    handleError(err, res, 'getUsers');
  }
};

module.exports = {
  register,
  login,
  getProfile,
  getUsers
};
