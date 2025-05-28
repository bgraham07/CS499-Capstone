const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Connect to the database
let dbURI = 'mongodb://127.0.0.1/travlr';
mongoose.connect(dbURI, {
  serverSelectionTimeoutMS: 30000
}).then(() => {
  console.log(`Connected to ${dbURI}`);
  seedDatabase();
}).catch(err => {
  console.error('Connection error:', err);
});

// Load models
require('./trip');
const Trip = mongoose.model('Trip');

// Load seed data
const seedData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../data/trips.json'), 'utf8')
);

// Function to seed the database
async function seedDatabase() {
  try {
    // Clear existing data
    console.log('Clearing existing trips...');
    await Trip.deleteMany({});
    
    // Create future dates for trips (1 year from now)
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    
    // Transform data to match schema
    const trips = seedData.map(trip => {
      // Create a future date by adding 1 year to the original date
      const originalDate = new Date(trip.start);
      const futureDate = new Date(originalDate);
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      return {
        name: trip.name,
        code: trip.code,
        length: trip.length,
        start: futureDate,
        resort: trip.resort,
        perPerson: trip.perPerson,
        image: trip.image,
        description: trip.description,
        location: trip.resort, // Use resort as location
        price: parseInt(trip.perPerson.replace('$', '').replace(',', '')), // Convert price to number
        date: futureDate, // Use future date
        // Add any missing required fields
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });
    
    // Insert seed data
    console.log(`Inserting ${trips.length} trips...`);
    
    // Use insertMany with ordered: false to continue even if some documents fail
    await Trip.insertMany(trips, { ordered: false });
    
    console.log('Database seeded successfully!');
    
    // List the inserted trips
    const insertedTrips = await Trip.find().lean();
    console.log(`Inserted ${insertedTrips.length} trips:`);
    insertedTrips.forEach(trip => {
      console.log(`- ${trip.name} (${trip.code}): $${trip.price}`);
    });
    
    // Close the connection
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding database:', err);
    
    // If it's a bulk write error, some documents might have been inserted
    if (err.name === 'BulkWriteError') {
      console.log(`Partially successful: ${err.insertedDocs.length} trips were inserted`);
      
      // List the inserted trips
      const insertedTrips = await Trip.find().lean();
      console.log(`Database now has ${insertedTrips.length} trips`);
    }
    
    mongoose.connection.close();
  }
}
