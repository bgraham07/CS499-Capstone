// Render the home page
const renderHomePage = (req, res) => {
    res.render('index', { 
        title: 'Travlr Getaways - Home',
        isHome: true // Mark the Home tab as active
    });
};

module.exports = {
    renderHomePage
};