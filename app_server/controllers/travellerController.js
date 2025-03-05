const Traveller = require('../models/traveller');

// Logic to handle travellers request
exports.getTravellerInfo = async (req, res) => {
    try {
        // Fetch all travellers from the database (which includes name, destination, and tourDate)
        const travellers = await Traveller.find();

        // Render travellerView with data from the database
        res.render('travellerView', { travellers: travellers });
    } catch (err) {
        console.log('Error fetching traveller data:', err);
        res.status(500).send('Error fetching traveller data');
    }
};

// New method to handle SPA request
exports.getTravellerSPA = async (req, res) => {
    try {
        // Fetch all travellers from the database (which includes name, destination, and tourDate)
        const travellers = await Traveller.find();

        // Send the travellers data as JSON for SPA
        res.json({ travellers: travellers });
    } catch (err) {
        console.log('Error fetching traveller data for SPA:', err);
        res.status(500).send('Error fetching traveller data');
    }
};