const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { createEncryptedSchemaType } = require('../utils/encryption');

// Register the encrypted string type
const EncryptedString = createEncryptedSchemaType(mongoose);

const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user'
};

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'manager', 'admin'],
    default: 'user'
  },
  hash: String,
  salt: String,
  // Encrypted fields for sensitive data
  phoneNumber: {
    type: EncryptedString,
    required: false
  },
  address: {
    type: EncryptedString,
    required: false
  },
  paymentInfo: {
    type: EncryptedString,
    required: false
  },
  // Security and account management
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  locked: {
    type: Boolean,
    default: false
  },
  lockedUntil: {
    type: Date,
    default: null
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ locked: 1 });

// Pre-save middleware to update the 'updatedAt' field
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to set password
userSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex');
};

// Method to validate password
userSchema.methods.validPassword = function(password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex');
  return this.hash === hash;
};

// Method to generate JWT
userSchema.methods.generateJwt = function() {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7); // Token expires in 7 days
  
  return jwt.sign({
    _id: this._id,
    email: this.email,
    name: this.name,
    role: this.role,
    exp: parseInt(expiry.getTime() / 1000)
  }, process.env.JWT_SECRET || 'MY_SECRET');
};

// Method to handle failed login attempts
userSchema.methods.handleFailedLogin = function() {
  this.loginAttempts += 1;
  
  // Lock account after 5 failed attempts
  if (this.loginAttempts >= 5) {
    this.locked = true;
    // Lock for 30 minutes
    const lockUntil = new Date();
    lockUntil.setMinutes(lockUntil.getMinutes() + 30);
    this.lockedUntil = lockUntil;
  }
  
  return this.save();
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  this.loginAttempts = 0;
  this.locked = false;
  this.lockedUntil = null;
  this.lastLogin = new Date();
  
  return this.save();
};

// Method to sanitize user data for API responses
userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  
  // Remove sensitive fields
  delete obj.hash;
  delete obj.salt;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  
  // Decrypt encrypted fields
  if (obj.phoneNumber) obj.phoneNumber = this.phoneNumber;
  if (obj.address) obj.address = this.address;
  
  // Never return payment info, even decrypted
  delete obj.paymentInfo;
  
  return obj;
};

mongoose.model('User', userSchema);
module.exports = {
  ROLES
};
