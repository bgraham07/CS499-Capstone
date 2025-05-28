const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const User = mongoose.model('users');

// Configure Passport to use the local strategy for user authentication
passport.use(new LocalStrategy(
  {
    usernameField: 'email' // Use 'email' instead of default 'username' field
  },
  async (email, password, done) => {
    try {
      console.log('Trying to authenticate:', email);
      console.log('MongoDB connection state:', mongoose.connection.readyState);
      
      // List all users in the database for debugging
      const allUsers = await User.find({});
      console.log('All users in database:', allUsers.map(u => u.email));
      
      // Try finding the user with case-insensitive search
      const user = await User.findOne({ 
        email: { $regex: new RegExp('^' + email + '$', 'i') } 
      });
      
      console.log('User found:', user ? user.email : 'null');

      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }

      // Check if the provided password matches the stored hash
      const isValidPassword = user.validPassword(password);
      console.log('Password validation result:', isValidPassword);
      
      if (!isValidPassword) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    } catch (err) {
      console.error('Authentication error:', err);
      return done(err);
    }
  }
));

// Serialize user ID into the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user by ID from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
