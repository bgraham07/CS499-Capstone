const express = require('express'); // Import the Express framework
const path = require('path'); // Built-in Node module for handling file paths
const mongoose = require('mongoose'); // MongoDB ODM
const passport = require('passport'); // Authentication middleware
const travellerRoutes = require('./app_server/routes/travellerRoutes'); // Server-rendered routes
const { engine } = require('express-handlebars'); // Handlebars templating engine
const cors = require('cors'); // Middleware for Cross-Origin Resource Sharing
const session = require('express-session'); // Session management

require('dotenv').config(); // Load environment variables from .env file
require('./app_api/models/user'); // Register the User model first
require('./app_api/models/db'); // Connect to MongoDB
require('./app_api/config/passport'); // Load JWT passport strategy

const app = express();

// Configure and enable express-session middleware
app.use(session({
  secret: 'your_secret_key', // Secret used to sign session ID cookies
  resave: false,
  saveUninitialized: true
}));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000; // Define the port to run the server

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Set up view engine with custom helpers
app.engine('hbs', engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, 'app_server', 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'app_server', 'views', 'partials'),
  helpers: {
    eq: function(a, b) {
      return a === b;
    }
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'app_server', 'views'));

// Middleware to parse incoming request bodies
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data

// Initialize Passport middleware for authentication
app.use(passport.initialize());
app.use(passport.session());

// Mount API routes first for backend services
const apiRouter = require('./app_api/routes/index');
app.use('/api', apiRouter);

// Mount UI routes (server-rendered Handlebars pages)
app.use('/', travellerRoutes);

// Optional route to render login form via Handlebars (if using UI views)
app.get('/login', (req, res) => {
    res.render('login');
});

// Start the Express server and listen on the defined port
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
