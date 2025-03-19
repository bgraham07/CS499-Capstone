const mongoose = require('mongoose');
const db = require('./db'); // Ensure db.js is executed and the connection is established
const Trip = require('./travlr'); // Load the trip model
const fs = require('fs');

// Read trip data from trips.json
const trips = JSON.parse(fs.readFileSync(__dirname + '/../../data/trips.json', 'utf8'));

const seedDB = async () => {
    try {
        console.log("Clearing existing trip records...");
        await Trip.deleteMany({}); // Remove all existing records

        console.log("Inserting new trip records...");
        await Trip.insertMany(trips); // Insert new data

        console.log("Database seeding completed!");
        mongoose.connection.close(); // Close the database connection
    } catch (error) {
        console.error("Error seeding the database:", error);
        mongoose.connection.close();
    }
};

seedDB();