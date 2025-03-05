const express = require('express');
const router = express.Router();
const passport = require('passport');
const travellerController = require('../controllers/travellerController');

// Route to get travellers
router.get('/', travellerController.getTravellerInfo);

// Route for SPA
router.get('/spa', travellerController.getTravellerSPA);

// Login Route
router.get('/login', (req, res) => {
    res.render('login');  // Render login page
});

// Handle login POST request with Passport
router.post('/login', passport.authenticate('local', {
    successRedirect: '/travellers',  // Redirect to traveller list after successful login
    failureRedirect: '/login',  // Redirect back to login if authentication fails
    failureFlash: true  // Allow flash messages for errors
}));

module.exports = router;