// Load environment variables from .env file
require('dotenv').config();

// Import mongoose to interact with MongoDB
const mongoose = require('mongoose');

// Register the user model definition
require('./app_api/models/user'); // Make sure the User model is registered

// Retrieve the registered User model
const User = mongoose.model('users');

// Asynchronous function to create and store a test user
const createTestUser = async () => {
  try {
    // Connect to the local MongoDB instance using the travlr database
    await mongoose.connect('mongodb://127.0.0.1:27017/travlr');

    // Create a new User instance with example credentials
    const user = new User();
    user.name = 'Test User';
    user.email = 'test@example.com';
    user.setPassword('Password123'); // this hashes the password and sets salt/hash

    // Save the new user to the database
    await user.save();

    // Log a success message and exit
    console.log('Test user created successfully.');
    process.exit(0);
  } catch (err) {
    // Log an error if user creation fails
    console.error('Error creating user:', err);
    process.exit(1);
  }
};

// Execute the function to create the test user
createTestUser();