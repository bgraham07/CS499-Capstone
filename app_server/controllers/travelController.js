// Get all trips with optional filtering
const renderTravelPage = async (req, res) => {
    try {
        // Extract filter parameters from query string
        const { destination, priceMin, priceMax, sortBy, sortDirection } = req.query;
        
        // Build filter object for MongoDB query
        let filter = {};
        if (destination) {
            filter.name = { $regex: destination, $options: 'i' }; // Case-insensitive search
        }
        
        // Add price range filters if provided
        if (priceMin || priceMax) {
            filter.perPerson = {};
            if (priceMin) filter.perPerson.$gte = parseInt(priceMin);
            if (priceMax) filter.perPerson.$lte = parseInt(priceMax);
        }
        
        // Build sort options
        let sort = {};
        if (sortBy) {
            sort[sortBy] = sortDirection === 'desc' ? -1 : 1;
        } else {
            sort.name = 1; // Default sort by name ascending
        }
        
        // Fetch trips from database with filters and sorting
        const trips = await Trip.find(filter).sort(sort);
        
        // Render the travel page with trips and filter values
        res.render('travel', { 
            title: 'Travlr Getaways - Travel',
            trips,
            filters: {
                destination,
                priceMin,
                priceMax,
                sortBy: sortBy || 'perPerson',
                sortDirection: sortDirection || 'asc'
            },
            isTravel: true // Mark the Travel tab as active
        });
    } catch (err) {
        console.error('Error fetching trips:', err);
        res.status(500).render('error', { 
            message: 'Error fetching trips',
            error: { status: 500, stack: err.stack }
        });
    }
};

module.exports = {
    renderTravelPage
};