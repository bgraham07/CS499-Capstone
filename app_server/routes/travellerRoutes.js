const express = require('express');
const router = express.Router();
const passport = require('passport');
const travellerController = require('../controllers/travellerController');
const travelController = require('../controllers/travel');  // Added travel controller

// Route to get and render all travellers via server-side HTML
router.get('/', travellerController.getTravellerInfo);

// Route to return traveller data for SPA in JSON format
router.get('/spa', travellerController.getTravellerSPA);

// Route to render the travel page with dynamic trip content
router.get('/travel', travelController.travelList);  // Added travel route

// GET route for displaying the login page
router.get('/login', (req, res) => {
    res.render('login');  // Render login page
});

// Handle login POST request with Passport authentication
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',  // Redirect to home page after successful login
    failureRedirect: '/login'  // Redirect back to login if authentication fails
}));

// GET route for logging out and destroying the user session
router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.session.destroy(() => {
            res.redirect('/login'); // Redirect to login page after logout
        });
    });
});

// Export the configured router
module.exports = router;