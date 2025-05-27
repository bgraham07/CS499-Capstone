const Traveller = require('../../app_api/models/traveller');

// Controller method to fetch traveller data and render it in a server-side view
exports.getTravellerInfo = async (req, res) => {
    try {
        // Retrieve all travellers from the database, including name, destination, and tourDate
        const travellers = await Traveller.find();

        // Render the 'travellerView' template, passing the travellers data for display
        res.render('travellerView', { travellers: travellers });
    } catch (err) {
        // Log any errors encountered during data retrieval and respond with a 500 error
        console.log('Error fetching traveller data:', err);
        res.status(500).send('Error fetching traveller data');
    }
};

// Controller method to fetch traveller data and send it as JSON for a Single Page Application (SPA)
exports.getTravellerSPA = async (req, res) => {
    try {
        // Retrieve all travellers from the database, including name, destination, and tourDate
        const travellers = await Traveller.find();

        // Respond with the travellers data in JSON format for client-side SPA consumption
        res.json({ travellers: travellers });
    } catch (err) {
        // Log any errors encountered during data retrieval and respond with a 500 error
        console.log('Error fetching traveller data for SPA:', err);
        res.status(500).send('Error fetching traveller data');
    }
};