const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const travellerRoutes = require('./app_server/routes/travellerRoutes');
const { engine } = require('express-handlebars'); // Updated import

require('./app_api/models/db');

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
app.use('/', travellerRoutes);  // Updated to ensure all routes, including /travel, are available

const apiRouter = require('./app_api/routes/index');
app.use('/api', apiRouter);

// Route to render login page
app.get('/login', (req, res) => {
    res.render('login'); // Renders login.hbs
});

// POST route to handle login form submission
app.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});