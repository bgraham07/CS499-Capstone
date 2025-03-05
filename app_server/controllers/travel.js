const fs = require('fs');
const path = require('path');

const tripsFilePath = path.join(__dirname, '../../data/trips.json');

// Function to get trips data
const travelList = (req, res) => {
    fs.readFile(tripsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading trips.json:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        const trips = JSON.parse(data);
        res.render('travel', { title: 'Travel', trips });
    });
};

module.exports = { travelList };