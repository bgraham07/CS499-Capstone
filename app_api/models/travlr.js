// Import mongoose for schema definition and MongoDB modeling
const mongoose = require('mongoose');

// Define the trip schema with all necessary fields and validation
const tripSchema = new mongoose.Schema({
    code: { type: String, required: true, index: true },        // Unique trip code, indexed for quick lookup
    name: { type: String, required: true, index: true },        // Name of the trip, indexed for search
    length: { type: String, required: true },                   // Duration of the trip
    start: { type: Date, required: true },                      // Start date of the trip
    resort: { type: String, required: true },                   // Associated resort for the trip
    perPerson: { type: String, required: true },                // Cost per individual
    image: { type: String, required: true },                    // Path or filename for the trip image
    description: { type: String, required: true }               // Text description of the trip
});

// Create the Trip model from the schema for use in CRUD operations
const Trip = mongoose.model('trips', tripSchema);

// Export the Trip model for use throughout the application
module.exports = Trip;