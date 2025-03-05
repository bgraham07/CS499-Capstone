module.exports = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();  // If the user is authenticated, proceed to the next middleware
    }
    res.redirect('/login');  // Redirect to login page if not authenticated
};