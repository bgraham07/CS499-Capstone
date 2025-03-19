const mongoose = require('mongoose');
const Trip = mongoose.model('Trip'); // Referencing the Trip model

// Controller to return all trips
const tripsList = async (req, res) => {
    try {
        const trips = await Trip.find({});
        if (!trips || trips.length === 0) {
            return res.status(404).json({ message: "No trips found" });
        }
        res.status(200).json(trips);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Controller to return a single trip by tripCode
const tripsFindByCode = async (req, res) => {
    try {
        const trip = await Trip.findOne({ code: req.params.tripCode });
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }
        res.status(200).json(trip);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Export controllers for use in routes
module.exports = {
    tripsList,
    tripsFindByCode
};