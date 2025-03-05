const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const travellerRoutes = require('./app_server/routes/travellerRoutes');
const { engine } = require('express-handlebars'); // Updated import

const app = express();
const PORT = 3000;

// Set Handlebars as the templating engine
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main', // Tell Handlebars to use the main.hbs layout
    layoutsDir: path.join(__dirname, 'app_server', 'views', 'layouts') // Specify the location of layout files
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'app_server', 'views'));

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // For parsing form data

// Setup sessions
app.use(session({
    secret: 'secretkey',  // Set a secret for session encryption
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // Set to true for HTTPS
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Flash messages
app.use(flash());

// Register routes
app.use('/travellers', travellerRoutes);

// Route to render login page
app.get('/login', (req, res) => {
    res.render('login'); // Renders login.hbs
});

// POST route to handle login form submission
app.post('/login', passport.authenticate('local', {
    successRedirect: '/travellers', // Redirect to /travellers if login is successful
    failureRedirect: '/login', // Redirect to /login if login fails
    failureFlash: true // Show flash message on login failure
}));

// Protected route for travellers
app.get('/travellers', isAuthenticated, (req, res) => {
    res.render('travellerView'); // Renders travellerView.hbs with data from the database
});

// Middleware to check if the user is authenticated before accessing /travellers
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login'); // Redirect to login page if not authenticated
}

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/travlrDB', {
    serverSelectionTimeoutMS: 50000  // Increases timeout to avoid buffering issues
})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

  require('./config/passport')(passport);
  
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});