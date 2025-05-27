// Export a middleware function that checks if the user is authenticated
module.exports = function(req, res, next) {
    // If the request is from an authenticated user, allow it to continue
    if (req.isAuthenticated()) {
        return next();  // Proceed to the next middleware or route handler
    }
    // If not authenticated, redirect the user to the login page
    res.redirect('/login');
};