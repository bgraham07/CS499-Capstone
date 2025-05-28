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

  console.log('Login attempt:', req.body.email);

  // Authenticate the user using Passport local strategy
  passport.authenticate('local', (err, user, info) => {
    console.log('Passport authenticate result:', { err, user: !!user, info });
    
    if (err) {
      console.error('Authentication error:', err);
      return res.status(500).json(err); // Return error if something goes wrong
    }

    if (user) {
      // If authentication is successful, return a new JWT token
      const token = user.generateJwt();
      console.log('Authentication successful, token generated');
      
      // Check if this is an API request or a form submission
      const isApiRequest = req.xhr || 
                          req.headers.accept.indexOf('json') > -1 ||
                          req.path.startsWith('/api/');
      
      if (isApiRequest) {
        // For API requests, return the token as JSON
        return res.status(200).json({ token });
      } else {
        // For form submissions, redirect to the home page
        req.login(user, (err) => {
          if (err) {
            console.error('Session login error:', err);
            return res.status(500).json(err);
          }
          return res.redirect('/');
        });
      }
    } else {
      // Return unauthorized if credentials are invalid
      console.log('Authentication failed:', info);
      
      // Check if this is an API request or a form submission
      const isApiRequest = req.xhr || 
                          req.headers.accept.indexOf('json') > -1 ||
                          req.path.startsWith('/api/');
      
      if (isApiRequest) {
        return res.status(401).json(info);
      } else {
        // For form submissions, redirect back to login page
        return res.redirect('/login');
      }
    }
  })(req, res);
};

module.exports = {
  register,
  login
};
