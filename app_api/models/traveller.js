// Import mongoose library for MongoDB object modeling
const mongoose = require('mongoose');

// Define the schema for the traveller collection.
// This schema includes:
// - name: Name of the traveller (required string)
// - destination: Destination the traveller is booking/heading to (required string)
// - tourDate: Date of the scheduled tour (required date)
const travellerSchema = new mongoose.Schema({
  // Name of the traveller (required string)
  name: { type: String, required: true },
  // Destination the traveller is booking or heading to (required string)
  destination: { type: String, required: true },
  // Date of the scheduled tour (required date field)
  tourDate: { type: Date, required: true }, // Added tour date field
});

// Create the Traveller model from the travellerSchema.
// This model provides an interface for CRUD operations on the traveller collection.
const Traveller = mongoose.model('Traveller', travellerSchema);

// Export the Traveller model for use in other parts of the application
module.exports = Traveller;