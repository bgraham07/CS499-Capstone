// Import node-fetch to perform HTTP requests to the backend API
const fetch = require('node-fetch');

// Controller to retrieve trip data from API and render the travel page
const travelList = async (req, res) => {
    try {
        // Extract filter parameters from query string
        const { destination, priceMin, priceMax, sortBy, sortDirection } = req.query;
        
        // Build the API URL with query parameters
        let apiUrl = 'http://localhost:3000/api/trips';
        const queryParams = [];
        
        if (destination) queryParams.push(`destination=${encodeURIComponent(destination)}`);
        if (priceMin) queryParams.push(`priceMin=${encodeURIComponent(priceMin)}`);
        if (priceMax) queryParams.push(`priceMax=${encodeURIComponent(priceMax)}`);
        if (sortBy) queryParams.push(`sortBy=${encodeURIComponent(sortBy)}`);
        if (sortDirection) queryParams.push(`sortDirection=${encodeURIComponent(sortDirection)}`);
        
        if (queryParams.length > 0) {
            apiUrl += `?${queryParams.join('&')}`;
        }
        
        console.log('Fetching trips from API:', apiUrl);
        
        // Make a GET request to the backend API to fetch trip data
        const response = await fetch(apiUrl);
        const trips = await response.json(); // Parse the JSON response
        
        // Format dates for display
        trips.forEach(trip => {
            if (trip.start) {
                const date = new Date(trip.start);
                trip.start = date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            }
        });

        // Render the 'travel' view, passing the trips data and page title
        res.render('travel', { 
            title: 'Travel', 
            trips,
            filters: {
                destination: destination || '',
                priceMin: priceMin || '',
                priceMax: priceMax || '',
                sortBy: sortBy || 'perPerson',
                sortDirection: sortDirection || 'asc'
            }
        });
    } catch (error) {
        // Log any errors and render the travel page with an error message
        console.error("Error fetching trips:", error);
        res.render('travel', { title: 'Travel', trips: [], message: "Error loading trips." });
    }
};

// Export the controller to be used in route definitions
module.exports = { travelList };
