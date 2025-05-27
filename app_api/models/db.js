// Import mongoose for MongoDB interaction
const mongoose = require('mongoose');

// Determine the host for MongoDB, defaulting to localhost
const host = process.env.DB_HOST || '127.0.0.1';
const dbURI = `mongodb://${host}/travlr`;

// Used to handle input/output for graceful shutdown on Windows
const readLine = require('readline');

// Function to initiate connection to MongoDB with slight delay
const connect = () => {
    setTimeout(() => mongoose.connect(dbURI, {}), 1000);
};

// Log when MongoDB connection is established
mongoose.connection.on('connected', () => {
    console.log(`Mongoose connected to ${dbURI}`);
});

// Log any errors during connection
mongoose.connection.on('error', err => {
    console.log('Mongoose connection error: ', err);
});

// Log when MongoDB is disconnected
mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

// Windows-specific workaround to properly handle Ctrl+C (SIGINT)
if (process.platform === 'win32') {
    const r1 = readLine.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    r1.on('SIGINT', () => {
        process.emit("SIGINT");
    });
}

// Graceful shutdown helper to log disconnection reason
const gracefulShutdown = (msg) => {
    mongoose.connection.close(() => {
        console.log(`Mongoose disconnected through ${msg}`);
    });
};

// Handle app restarts (nodemon)
process.once('SIGUSR2', () => {
    gracefulShutdown('nodemon restart');
    process.kill(process.pid, 'SIGUSR2');
});

// Handle app termination (Ctrl+C)
process.on('SIGINT', () => {
    gracefulShutdown('app termination');
    process.exit(0);
});

// Handle Heroku-style shutdowns
process.on('SIGTERM', () => {
    gracefulShutdown('app shutdown');
    process.exit(0);
});

// Start the initial connection to the database
connect();

// Load schema definitions for Mongoose
require('./travlr');
require('./trip');

// Export mongoose for use elsewhere in the app
module.exports = mongoose;