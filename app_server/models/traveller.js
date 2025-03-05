const mongoose = require('mongoose');

// Define the schema for the traveller, including tours with dates
const travellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  destination: { type: String, required: true },
  tourDate: { type: Date, required: true }, // Added tour date field
});

// Create the model from the schema
const Traveller = mongoose.model('Traveller', travellerSchema);

module.exports = Traveller;