const mongoose = require('mongoose');
const Trip = require('../models/trip'); // Import the Trip model
const User = mongoose.model('users');

const getUser = async (req, res, callback) => {
    console.log("Payload from token:", req.auth);
    if (req.auth && req.auth.email) {
        try {
            const user = await User.findOne({ email: req.auth.email });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            callback(req, res, user.name);
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(404).json({ message: "User not found" });
    }
};

// GET - Retrieve all trips
const getTrips = async (req, res) => {
    try {
        const trips = await Trip.find(); // Get all trips from MongoDB
        res.status(200).json(trips);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving trips', error });
    }
};

// POST - Create a new trip
const createTrip = async (req, res) => {
    getUser(req, res, async () => {
        try {
            const newTrip = new Trip(req.body);
            await newTrip.save();
            res.status(201).json(newTrip);
        } catch (error) {
            res.status(400).json({ message: 'Error creating trip', error });
        }
    });
};

// PUT - Update an existing trip by ID
const updateTrip = async (req, res) => {
    getUser(req, res, async () => {
        try {
            const { id } = req.params;
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

// DELETE - Remove a trip by ID
const deleteTrip = async (req, res) => {
    try {
        const { id } = req.params; // Extract trip ID from URL
        const deletedTrip = await Trip.findByIdAndDelete(id);
        if (!deletedTrip) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        res.status(200).json({ message: 'Trip deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting trip', error });
    }
};

// Export controller functions
module.exports = {
    getTrips,
    createTrip,
    updateTrip,
    deleteTrip
};