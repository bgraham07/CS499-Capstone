// Import mongoose for schema definition and MongoDB modeling
const mongoose = require('mongoose');

// Define the schema for the Trip collection with validation and types
const tripSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Trip name is required'],
    trim: true
  },
  code: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Trip description is required'],
    trim: true,
    default: 'A wonderful trip experience'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  perPerson: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  resort: {
    type: String,
    trim: true
  },
  length: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true,
    default: 'default.jpg'
  },
  start: {
    type: Date
  },
  date: {
    type: Date,
    required: [true, 'Trip date is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  // This will add virtual getters to the JSON output
  toJSON: { virtuals: true },
  // This will add virtual getters to the object output
  toObject: { virtuals: true }
});

// Pre-save middleware to update the 'updatedAt' field
tripSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create and export the Trip model
mongoose.model('Trip', tripSchema);
