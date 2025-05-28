const mongoose = require('mongoose');

// Connect to the database
mongoose.connect('mongodb://127.0.0.1/travlr', {
  serverSelectionTimeoutMS: 30000
}).then(() => {
  console.log('Connected to MongoDB');
  addSampleTrip();
}).catch(err => {
  console.error('Connection error:', err);
});

// Load Trip model
require('./app_api/models/trip');
const Trip = mongoose.model('Trip');

async function addSampleTrip() {
  try {
    // Create a future date (1 year from now)
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    
    // Create a sample trip
    const sampleTrip = new Trip({
      name: 'Luxury Beach Getaway',
      code: 'LBG001',
      length: '7 days',
      start: futureDate,
      resort: 'Paradise Beach Resort',
      perPerson: '$1,999',
      image: 'beach.jpg',
      description: 'Enjoy a week of luxury at our exclusive beach resort with pristine waters and white sand beaches.',
      location: 'Paradise Beach Resort',
      price: 1999,
      date: futureDate,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Save the trip
    await sampleTrip.save();
    console.log('Sample trip added successfully!');
    
    // List all trips
    const trips = await Trip.find().lean();
    console.log(`Database now has ${trips.length} trips:`);
    trips.forEach(trip => {
      console.log(`- ${trip.name} (${trip.code}): $${trip.price}`);
    });
    
    // Close the connection
    mongoose.connection.close();
  } catch (err) {
    console.error('Error adding sample trip:', err);
    mongoose.connection.close();
  }
}