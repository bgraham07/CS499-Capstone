// Import mongoose for schema definition and MongoDB modeling
const mongoose = require('mongoose');

// Define the schema for the Trip collection with validation and types
const tripSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },       // Unique code identifier for the trip
    name: { type: String, required: true },                     // Name of the trip
    length: { type: Number, required: true },                   // Duration of the trip in days
    start: { type: Date, required: true },                      // Start date of the trip
    resort: { type: String, required: true },                   // Name of the resort
    perPerson: { type: Number, required: true },                // Cost per person
    image: { type: String, required: true },                    // Filename or URL of the trip image
    description: { type: String, required: true }               // Description of the trip
});

// Export the compiled Trip model for use in application logic
module.exports = mongoose.model('Trip', tripSchema);