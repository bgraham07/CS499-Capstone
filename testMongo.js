const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    await mongoose.connect('mongodb://127.0.0.1/travlr', {
      serverSelectionTimeoutMS: 5000,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connection successful!');
    
    // Create a simple model and test it
    const TestModel = mongoose.model('Test', new mongoose.Schema({
      name: String,
      date: { type: Date, default: Date.now }
    }));
    
    // Try to save a document
    const testDoc = new TestModel({ name: 'Test Document' });
    await testDoc.save();
    console.log('Successfully saved a test document!');
    
    // Try to retrieve documents
    const docs = await TestModel.find();
    console.log(`Found ${docs.length} test documents`);
    
    // Clean up
    await TestModel.deleteMany({});
    console.log('Cleaned up test documents');
    
    mongoose.connection.close();
    console.log('Connection closed');
  } catch (err) {
    console.error('MongoDB connection test failed:', err);
    console.error('Please make sure MongoDB is running on your machine');
    console.error('You can start MongoDB with: mongod --dbpath=/path/to/data/db');
  }
}

testConnection();