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
      // Attempt to find a user by email
      const user = await User.findOne({ email });
      console.log('Trying to authenticate:', email);
      console.log('User found:', user);

      // If user is not found, authentication fails
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }

      // Check if the provided password matches the stored hash
      if (!user.validPassword(password)) {
        console.log('Password matches:', user ? user.validPassword(password) : null);
        return done(null, false, { message: 'Incorrect password.' });
      }
      console.log('Password matches:', user ? user.validPassword(password) : null);

      // If all checks pass, authentication succeeds
      return done(null, user);
    } catch (err) {
      // Handle unexpected errors during authentication
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