const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Define the schema for user accounts
const userSchema = new mongoose.Schema({
  // Unique and required email field for user identification
  email: {
    type: String,
    unique: true,
    required: true
  },
  // Required name field for the user's display name
  name: {
    type: String,
    required: true
  },
  // Hashed password stored after salting
  hash: String,
  // Random salt used for password hashing
  salt: String
});

// Method to securely set the password by generating a salt and hashing the password
userSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex');
};

// Method to validate a password against the stored hash
userSchema.methods.validPassword = function(password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex');
  return this.hash === hash;
};

// Method to generate a signed JSON Web Token (JWT) for the user
userSchema.methods.generateJwt = function() {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7); // Token valid for 7 days

  return jwt.sign({
    _id: this._id,
    email: this.email,
    name: this.name,
    exp: parseInt(expiry.getTime() / 1000, 10), // JWT exp is in seconds
  }, process.env.JWT_SECRET);
};

// Register the user model with Mongoose
mongoose.model('users', userSchema);
