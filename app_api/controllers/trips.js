const mongoose = require('mongoose');
const Trip = mongoose.model('Trip');
const { handleError } = require('../utils/errorHandler');
const { optimizeQuery } = require('../utils/queryOptimizer');
const { dbLimiter } = require('../utils/rateLimiter');

/**
 * GET /api/trips
 * Get all trips with pagination, sorting, filtering
 */
const getTrips = async (req, res) => {
  try {
    console.log('GET /api/trips request received with query:', req.query);
    
    // Define allowed fields and filter mappings
    const allowedFields = ['name', 'location', 'price', 'description', 'date', 'createdAt', 'resort', 'perPerson', 'code'];
    const filterMapping = {
      location: 'location',
      destination: 'resort', // Map destination to resort for backward compatibility
      minPrice: { field: 'perPerson', operator: 'gte' },
      maxPrice: { field: 'perPerson', operator: 'lte' },
      priceMin: { field: 'perPerson', operator: 'gte' }, // Alternative name
      priceMax: { field: 'perPerson', operator: 'lte' }, // Alternative name
      search: { field: 'name', operator: 'regex' },
      fromDate: { field: 'date', operator: 'gte' },
      toDate: { field: 'date', operator: 'lte' }
    };
    
    // Build filter object
    let filter = {};
    
    // Process each query parameter
    Object.keys(req.query).forEach(key => {
      // Skip pagination and sorting parameters
      if (['page', 'limit', 'sort', 'sortBy', 'sortDirection'].includes(key)) {
        return;
      }
      
      // Check if this is a mapped filter
      if (filterMapping[key]) {
        const mapping = filterMapping[key];
        
        // Handle simple field mapping
        if (typeof mapping === 'string') {
          filter[mapping] = req.query[key];
        } 
        // Handle complex mapping with operators
        else if (typeof mapping === 'object') {
          const { field, operator } = mapping;
          
          // Initialize the field object if it doesn't exist
          if (!filter[field]) {
            filter[field] = {};
          }
          
          // Handle regex operator for search
          if (operator === 'regex') {
            filter[field] = { $regex: req.query[key], $options: 'i' };
          } 
          // Handle other operators
          else {
            filter[field][`$${operator}`] = req.query[key];
          }
        }
      }
    });
    
    console.log('Constructed filter:', filter);
    
    // Handle sorting
    let sort = {};
    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortDirection = req.query.sortDirection === 'desc' ? -1 : 1;
      sort[sortField] = sortDirection;
    } else {
      // Default sort
      sort = { date: -1 };
    }
    
    console.log('Sort criteria:', sort);
    
    // Handle pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Execute query
    console.log('Executing Trip.find()...');
    const trips = await Trip.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
    
    console.log(`Found ${trips.length} trips`);
    
    // Get total count for pagination
    const totalResults = await Trip.countDocuments(filter);
    
    // Calculate total pages
    const totalPages = Math.ceil(totalResults / limit);
    
    // Send response with pagination metadata
    res.status(200).json({
      data: trips,
      pagination: {
        page,
        limit,
        totalPages,
        totalResults
      }
    });
  } catch (err) {
    console.error('Error in getTrips:', err);
    res.status(500).json({
      message: 'Error retrieving trips',
      error: err.message
    });
  }
};

/**
 * GET /api/trips/:tripId
 * Get a specific trip by ID
 */
const getTripById = async (req, res) => {
  try {
    const tripId = req.params.tripId;
    console.log(`Getting trip with ID: ${tripId}`);
    
    // Find trip with rate limiting
    const trip = await dbLimiter(`trips:get:${tripId}`, async () => {
      return Trip.findById(tripId).lean().exec();
    });
    
    if (!trip) {
      throw new Error(`Trip with ID ${tripId} not found`);
    }
    
    res.status(200).json(trip);
  } catch (err) {
    handleError(err, res, 'getTripById');
  }
};

/**
 * POST /api/trips
 * Create a new trip
 */
const createTrip = async (req, res) => {
  try {
    console.log('Creating new trip with data:', req.body);
    
    // Create a future date for the trip (if not provided)
    if (!req.body.date) {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      req.body.date = futureDate;
    }
    
    // Ensure all required fields are present
    const requiredFields = ['name', 'description', 'price', 'location', 'date'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
        error: 'Validation Error'
      });
    }
    
    // Add default description if not provided
    if (!req.body.description) {
      req.body.description = `Trip to ${req.body.resort || req.body.location}`;
    }
    
    console.log('Prepared trip data:', req.body);
    
    // Create trip with rate limiting
    const newTrip = new Trip(req.body);
    console.log('Created new Trip instance:', newTrip);
    
    const savedTrip = await newTrip.save();
    console.log('Trip saved successfully:', savedTrip);
    
    res.status(201).json(savedTrip);
  } catch (err) {
    console.error('Error in createTrip:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.keys(err.errors).map(field => ({
        field,
        message: err.errors[field].message
      }));
      
      console.error('Validation errors:', validationErrors);
      
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Handle other errors
    res.status(500).json({
      message: 'Error creating trip',
      error: err.message
    });
  }
};

/**
 * PUT /api/trips/:tripId
 * Update a trip
 */
const updateTrip = async (req, res) => {
  try {
    const tripId = req.params.tripId;
    console.log(`Updating trip with ID: ${tripId}`);
    console.log('Update data:', req.body);
    
    // Update trip with rate limiting
    const updatedTrip = await dbLimiter(`trips:update:${tripId}`, async () => {
      return Trip.findByIdAndUpdate(
        tripId,
        req.body,
        { 
          new: true,
          runValidators: true
        }
      ).exec();
    });
    
    if (!updatedTrip) {
      throw new Error(`Trip with ID ${tripId} not found`);
    }
    
    console.log('Trip updated successfully:', updatedTrip);
    res.status(200).json(updatedTrip);
  } catch (err) {
    console.error('Error in updateTrip:', err);
    handleError(err, res, 'updateTrip');
  }
};

/**
 * DELETE /api/trips/:tripId
 * Delete a trip
 */
const deleteTrip = async (req, res) => {
  try {
    const tripId = req.params.tripId;
    console.log(`Deleting trip with ID: ${tripId}`);
    
    // Delete trip with rate limiting
    const deletedTrip = await dbLimiter(`trips:delete:${tripId}`, async () => {
      return Trip.findByIdAndDelete(tripId).exec();
    });
    
    if (!deletedTrip) {
      throw new Error(`Trip with ID ${tripId} not found`);
    }
    
    console.log('Trip deleted successfully');
    res.status(204).send();
  } catch (err) {
    console.error('Error in deleteTrip:', err);
    handleError(err, res, 'deleteTrip');
  }
};

module.exports = {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip
};
