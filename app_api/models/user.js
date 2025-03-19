const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the user schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Hash the password before saving it
userSchema.pre('save', async function(next) {
    const user = this;

    if (!user.isModified('password')) return next(); // Skip hashing if password is not modified

    try {
        const salt = await bcrypt.genSalt(10); // Generate salt
        user.password = await bcrypt.hash(user.password, salt); // Hash password
        next();
    } catch (err) {
        return next(err);
    }
});

// Compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password); // Compare the input password with the hashed one
};

// Create and export the model
const User = mongoose.model('User', userSchema);
module.exports = User;