// Import node-fetch to perform HTTP requests to the backend API
const fetch = require('node-fetch');

// Controller to retrieve trip data from API and render the travel page
const travelList = async (req, res) => {
    try {
        // Make a GET request to the backend API to fetch trip data
        const response = await fetch('http://localhost:3000/api/trips');
        const trips = await response.json(); // Parse the JSON response

        // Render the 'travel' view, passing the trips data and page title
        res.render('travel', { title: 'Travel', trips });
    } catch (error) {
        // Log any errors and render the travel page with an error message
        console.error("Error fetching trips:", error);
        res.render('travel', { title: 'Travel', trips: [], message: "Error loading trips." });
    }
};

// Export the controller to be used in route definitions
module.exports = { travelList };