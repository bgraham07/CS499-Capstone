const fetch = require('node-fetch');

const travelList = async (req, res) => {
    try {
        const response = await fetch('http://localhost:3000/api/trips');
        const trips = await response.json();

        res.render('travel', { title: 'Travel', trips });
    } catch (error) {
        console.error("Error fetching trips:", error);
        res.render('travel', { title: 'Travel', trips: [], message: "Error loading trips." });
    }
};

module.exports = { travelList };