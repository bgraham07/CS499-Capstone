const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trips'); // Import trip controller
const ctrlAuth = require('../controllers/authentication'); // Import authentication controller
const { expressjwt: jwt } = require('express-jwt'); // Import express-jwt

// Middleware to protect routes using JWT
const auth = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  userProperty: 'payload' // Attach decoded JWT to req.payload
});
console.log("JWT middleware initialized with secret:", process.env.JWT_SECRET);

// Temporary logging middleware for protected routes
router.use('/trips', (req, res, next) => {
  console.log("🔍 Incoming request headers:", req.headers.authorization);
  next();
});

// GET - Retrieve all trips (public route)
router.get('/trips', tripController.getTrips);

// POST - Create a new trip (protected route)
router.post('/trips', auth, tripController.createTrip);

// PUT - Update a trip by ID (protected route)
router.put('/trips/:id', auth, tripController.updateTrip);

// DELETE - Delete a trip by ID (protected route)
router.delete('/trips/:id', auth, tripController.deleteTrip);

// Authentication routes (public access)
router.post('/register', ctrlAuth.register); // User registration
router.post('/login', ctrlAuth.login);       // User login

// Export the router to be used in app.js or server.js
module.exports = router;