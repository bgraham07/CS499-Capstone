const mongoose = require('mongoose');

// Set the database URI
let dbURI = 'mongodb://127.0.0.1/travlr';

// If we're in production, use the production database
if (process.env.NODE_ENV === 'production') {
  dbURI = process.env.MONGODB_URI;
}

console.log('Attempting to connect to MongoDB...');

// Connect to MongoDB with updated options (removed deprecated ones)
mongoose.connect(dbURI, {
  serverSelectionTimeoutMS: 30000  // Increase timeout to 30 seconds
}).then(() => {
  console.log(`Mongoose connected to ${dbURI}`);
}).catch(err => {
  console.error('MongoDB connection error:', err);
  console.error('Please make sure MongoDB is running on your machine');
});

// CONNECTION EVENTS
mongoose.connection.on('connected', () => {
  console.log(`Mongoose connected to ${dbURI}`);
});

mongoose.connection.on('error', err => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// CAPTURE APP TERMINATION / RESTART EVENTS
const gracefulShutdown = (msg, callback) => {
  mongoose.connection.close()
    .then(() => {
      console.log(`Mongoose disconnected through ${msg}`);
      callback();
    })
    .catch(() => {
      callback();
    });
};

// For nodemon restarts
process.once('SIGUSR2', () => {
  gracefulShutdown('nodemon restart', () => {
    process.kill(process.pid, 'SIGUSR2');
  });
});

// For app termination
process.on('SIGINT', () => {
  gracefulShutdown('app termination', () => {
    process.exit(0);
  });
});

// For Heroku app termination
process.on('SIGTERM', () => {
  gracefulShutdown('Heroku app shutdown', () => {
    process.exit(0);
  });
});

// BRING IN YOUR SCHEMAS & MODELS
require('./trip');
require('./user');
