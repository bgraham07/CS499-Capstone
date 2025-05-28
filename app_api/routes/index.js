const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trips'); // Import trip controller
const ctrlAuth = require('../controllers/authentication'); // Import authentication controller
const authMiddleware = require('../middleware/auth'); // Import our new auth middleware
const systemController = require('../controllers/system');
const { apiLimiter, loginLimiter } = require('../utils/rateLimiter');
const { validate, schemas } = require('../middleware/validate'); // Import validation middleware

// Apply general API rate limiter to all routes
router.use(apiLimiter);

// Temporary logging middleware for protected routes
router.use('/trips', (req, res, next) => {
  console.log("🔍 Incoming request headers:", req.headers.authorization);
  next();
});

// GET - Retrieve all trips (public route)
router.get('/trips', tripController.getTrips);

// GET - Retrieve a specific trip by ID
router.get('/trips/:tripId', tripController.getTripById);

// POST - Create a new trip (protected route - managers and admins only)
router.post('/trips', 
  authMiddleware.requireManager, 
  tripController.createTrip
);

// PUT - Update a trip by ID (protected route - managers and admins only)
router.put('/trips/:tripId', 
  authMiddleware.requireManager, 
  tripController.updateTrip
);

// DELETE - Delete a trip by ID (protected route - admins only)
router.delete('/trips/:tripId', 
  authMiddleware.requireAdmin, 
  tripController.deleteTrip
);

// Authentication routes (public access) with login rate limiting
router.post('/register', 
  loginLimiter, 
  validate(schemas.userRegister), 
  ctrlAuth.register
); // User registration

router.post('/login', 
  loginLimiter, 
  validate(schemas.userLogin), 
  ctrlAuth.login
); // User login

// Add some debugging for login route
router.use('/login', (req, res, next) => {
  console.log("Login route accessed with method:", req.method);
  console.log("Login request body:", req.body);
  next();
});

// New route to get user profile (any authenticated user)
router.get('/profile', authMiddleware.requireAuth, ctrlAuth.getProfile);

// New admin-only route to get all users
router.get('/users', authMiddleware.requireAdmin, ctrlAuth.getUsers);

// New admin-only route to check system health
router.get('/system/health', authMiddleware.requireAdmin, systemController.healthCheck);

// Export the router to be used in app.js or server.js
module.exports = router;
