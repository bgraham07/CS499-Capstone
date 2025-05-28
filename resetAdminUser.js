require('dotenv').config();
const mongoose = require('mongoose');
require('./app_api/models/user');
const User = mongoose.model('User');

const resetAdminUser = async () => {
  try {
    // Connect to MongoDB
    const host = process.env.DB_HOST || '127.0.0.1';
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;
    const dbURI = dbUser && dbPassword 
      ? `mongodb://${dbUser}:${dbPassword}@${host}/travlr?authSource=admin` 
      : `mongodb://${host}/travlr`;
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(dbURI);
    console.log('Connected to MongoDB');
    
    // Check if admin user exists
    const adminEmail = 'admin@example.com';
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (adminUser) {
      console.log('Admin user found, resetting password...');
      adminUser.setPassword('Admin123');
      adminUser.role = 'admin'; // Ensure admin role
      await adminUser.save();
    } else {
      console.log('Admin user not found, creating new admin user...');
      adminUser = new User();
      adminUser.name = 'Admin User';
      adminUser.email = adminEmail;
      adminUser.role = 'admin';
      adminUser.setPassword('Admin123');
      await adminUser.save();
    }
    
    console.log('Admin user reset successfully:');
    console.log('- Email: admin@example.com');
    console.log('- Password: Admin123');
    console.log('- Role:', adminUser.role);
    
    // Also check for test user
    const testEmail = 'test@example.com';
    let testUser = await User.findOne({ email: testEmail });
    
    if (testUser) {
      console.log('Test user found, resetting password...');
      testUser.setPassword('Password123');
      await testUser.save();
    } else {
      console.log('Test user not found, creating new test user...');
      testUser = new User();
      testUser.name = 'Test User';
      testUser.email = testEmail;
      testUser.role = 'user';
      testUser.setPassword('Password123');
      await testUser.save();
    }
    
    console.log('Test user reset successfully:');
    console.log('- Email: test@example.com');
    console.log('- Password: Password123');
    console.log('- Role:', testUser.role);
    
    // List all users in the database
    const allUsers = await User.find({});
    console.log('\nAll users in database:');
    allUsers.forEach(user => {
      console.log(`- ${user.email} (${user.role})`);
    });
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
};

resetAdminUser();