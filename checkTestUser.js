// Load environment variables from .env file
require('dotenv').config();

// Import mongoose to interact with MongoDB
const mongoose = require('mongoose');

// Register the user model definition
require('./app_api/models/user');

// Retrieve the registered User model
const User = mongoose.model('users');

// Asynchronous function to check if test user exists
const checkTestUser = async () => {
  try {
    // Connect to the local MongoDB instance using the travlr database
    await mongoose.connect('mongodb://127.0.0.1:27017/travlr');

    // Find the test user by email
    const user = await User.findOne({ email: 'test@example.com' });
    
    if (user) {
      console.log('Test user exists:');
      console.log('- Name:', user.name);
      console.log('- Email:', user.email);
      console.log('- Has password hash:', !!user.hash);
      console.log('- Has salt:', !!user.salt);
    } else {
      console.log('Test user does not exist. Creating now...');
      
      // Create a new User instance with example credentials
      const newUser = new User();
      newUser.name = 'Test User';
      newUser.email = 'test@example.com';
      newUser.setPassword('Password123'); // this hashes the password and sets salt/hash

      // Save the new user to the database
      await newUser.save();
      console.log('Test user created successfully.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

// Run the function
checkTestUser();