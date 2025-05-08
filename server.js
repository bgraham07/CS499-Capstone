const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const travellerRoutes = require('./app_server/routes/travellerRoutes');
const { engine } = require('express-handlebars');
const cors = require('cors');

require('dotenv').config(); // Load environment variables
require('./app_api/models/user'); // Register the User model first
require('./app_api/models/db');
require('./app_api/config/passport'); // Load JWT passport strategy

const app = express();
const PORT = 3000;

// Enable CORS to allow requests from Angular frontend
app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Set Handlebars as the templating engine
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'app_server', 'views', 'layouts')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'app_server', 'views'));

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport.js
app.use(passport.initialize());

// ✅ Register API routes first
const apiRouter = require('./app_api/routes/index');
app.use('/api', apiRouter);

// Then register your UI routes
app.use('/', travellerRoutes);

// Optional form-based login view
app.get('/login', (req, res) => {
    res.render('login');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});