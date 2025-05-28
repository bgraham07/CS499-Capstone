require('dotenv').config();
const mongoose = require('mongoose');
require('./app_api/models/user');
const User = mongoose.model('users');

const createAnotherTestUser = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/travlr');
    
    // Create a new test user with different credentials
    const user = new User();
    user.name = 'Admin User';
    user.email = 'admin@example.com';
    user.setPassword('Admin123');
    
    await user.save();
    console.log('New test user created successfully:');
    console.log('- Email: admin@example.com');
    console.log('- Password: Admin123');
    
    process.exit(0);
  } catch (err) {
    console.error('Error creating user:', err);
    process.exit(1);
  }
};

createAnotherTestUser();