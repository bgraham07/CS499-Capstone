const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('users');

// Controller for user registration
const register = async (req, res) => {
  // Ensure all required fields are provided
  if (!req.body.name || !req.body.email || !req.body.password) {
    return res.status(400).json({ message: 'All fields required' });
  }

  // Create a new user instance and assign form values
  const user = new User();
  user.name = req.body.name;
  user.email = req.body.email;
  user.setPassword(req.body.password); // Hash and set password securely

  try {
    // Attempt to save the new user to the database
    await user.save();
    // Generate a JWT token upon successful registration
    const token = user.generateJwt();
    res.status(200).json({ token });
  } catch (err) {
    // Return error if save fails (e.g., duplicate email)
    res.status(400).json(err);
  }
};

// Controller for user login
const login = (req, res) => {
  // Ensure both email and password are provided
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ message: 'All fields required' });
  }

  // Authenticate the user using Passport local strategy
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(404).json(err); // Return error if something goes wrong
    }

    if (user) {
      // If authentication is successful, return a new JWT token
      const token = user.generateJwt();
      res.status(200).json({ token });
    } else {
      // Return unauthorized if credentials are invalid
      res.status(401).json(info);
    }
  })(req, res);
};

module.exports = {
  register,
  login
};