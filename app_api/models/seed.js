// Import required modules
const mongoose = require('mongoose');
const db = require('./db'); // Ensure db.js is executed and the connection is established
const Trip = require('./travlr'); // Load the trip model (schema for trips)
const fs = require('fs');

// Read and parse trip data from the trips.json file
// This file should contain an array of trip objects to seed the database
const trips = JSON.parse(fs.readFileSync(__dirname + '/../../data/trips.json', 'utf8'));

// Asynchronous function to seed the database with trip data
const seedDB = async () => {
    try {
        // Remove all existing trip records from the collection
        console.log("Clearing existing trip records...");
        await Trip.deleteMany({});

        // Insert the new trip records from the JSON file
        console.log("Inserting new trip records...");
        await Trip.insertMany(trips);

        // Log completion and close the database connection
        console.log("Database seeding completed!");
        mongoose.connection.close();
    } catch (error) {
        // Log errors and ensure the database connection is closed
        console.error("Error seeding the database:", error);
        mongoose.connection.close();
    }
};

// Invoke the seedDB function to start the seeding process
seedDB();