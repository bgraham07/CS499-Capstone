const mongoose = require('mongoose');
const Trip = require('../models/trip'); // Import the Trip model
const User = mongoose.model('users');

// Utility function to extract the authenticated user from the JWT
const getUser = async (req, res, callback) => {
    console.log("Payload from token:", req.auth);
    if (req.auth && req.auth.email) {
        try {
            // Attempt to find a user based on the email from the JWT payload
            const user = await User.findOne({ email: req.auth.email });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            callback(req, res, user.name); // Proceed with user-specific logic
        } catch (err) {
            return res.status(500).json(err); // Handle DB or lookup errors
        }
    } else {
        return res.status(404).json({ message: "User not found" });
    }
};

// GET - Retrieve all trips from the database
const getTrips = async (req, res) => {
    try {
        const trips = await Trip.find(); // Fetch all trips
        res.status(200).json(trips); // Return trip data
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving trips', error });
    }
};

// POST - Create a new trip; requires user authentication
const createTrip = async (req, res) => {
    getUser(req, res, async () => {
        try {
            const newTrip = new Trip(req.body); // Create trip from request body
            await newTrip.save(); // Save to database
            res.status(201).json(newTrip); // Respond with created trip
        } catch (error) {
            res.status(400).json({ message: 'Error creating trip', error });
        }
    });
};

// PUT - Update an existing trip by its ID; requires user authentication
const updateTrip = async (req, res) => {
    getUser(req, res, async () => {
        try {
            const { id } = req.params;
            // Attempt to find and update the trip by ID
            const updatedTrip = await Trip.findByIdAndUpdate(id, req.body, { new: true });
            if (!updatedTrip) {
                return res.status(404).json({ message: 'Trip not found' });
            }
            res.status(200).json(updatedTrip);
        } catch (error) {
            res.status(400).json({ message: 'Error updating trip', error });
        }
    });
};

// DELETE - Remove a trip by its ID
const deleteTrip = async (req, res) => {
    try {
        const { id } = req.params; // Extract trip ID from URL
        const deletedTrip = await Trip.findByIdAndDelete(id); // Attempt to delete
        if (!deletedTrip) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        res.status(200).json({ message: 'Trip deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting trip', error });
    }
};

// Export all controller functions
module.exports = {
    getTrips,
    createTrip,
    updateTrip,
    deleteTrip
};