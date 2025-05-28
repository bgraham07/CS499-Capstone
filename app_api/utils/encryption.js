/**
 * Utility for encrypting and decrypting sensitive data
 */
const crypto = require('crypto');

// Get encryption key from environment variables or generate a secure one
// In production, this should be set as an environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 
  crypto.randomBytes(32).toString('hex');

// Initialization vector length
const IV_LENGTH = 16;

/**
 * Encrypt a string or object
 * @param {String|Object} data - Data to encrypt
 * @returns {String} Encrypted data as hex string
 */
const encrypt = (data) => {
  try {
    // Convert objects to JSON strings
    if (typeof data === 'object') {
      data = JSON.stringify(data);
    }
    
    // Generate a random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher using AES-256-CBC algorithm
    const cipher = crypto.createCipheriv(
      'aes-256-cbc', 
      Buffer.from(ENCRYPTION_KEY, 'hex'), 
      iv
    );
    
    // Encrypt the data
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Combine IV and encrypted data
    return iv.toString('hex') + ':' + encrypted;
  } catch (err) {
    console.error('Encryption error:', err);
    return null;
  }
};

/**
 * Decrypt an encrypted string
 * @param {String} encryptedData - Data to decrypt (format: iv:encryptedData)
 * @returns {String|Object} Decrypted data
 */
const decrypt = (encryptedData) => {
  try {
    // Split IV and encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    // Create decipher
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc', 
      Buffer.from(ENCRYPTION_KEY, 'hex'), 
      iv
    );
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    // Try to parse as JSON if it looks like JSON
    if (decrypted.startsWith('{') || decrypted.startsWith('[')) {
      try {
        return JSON.parse(decrypted);
      } catch (e) {
        // If parsing fails, return as string
        return decrypted;
      }
    }
    
    return decrypted;
  } catch (err) {
    console.error('Decryption error:', err);
    return null;
  }
};

/**
 * Create a mongoose schema type for encrypted strings
 * @param {Object} mongoose - Mongoose instance
 * @returns {Object} Mongoose schema type
 */
const createEncryptedSchemaType = (mongoose) => {
  // Create a custom schema type
  class EncryptedString extends mongoose.SchemaType {
    constructor(key, options) {
      super(key, options, 'EncryptedString');
    }
    
    // Cast the value before saving
    cast(val) {
      if (val === null || val === undefined) {
        return val;
      }
      
      // If already encrypted (starts with hex IV), return as is
      if (typeof val === 'string' && /^[0-9a-f]{32}:/.test(val)) {
        return val;
      }
      
      // Encrypt the value
      return encrypt(val);
    }
    
    // Custom getter to decrypt when accessing
    get(val) {
      if (!val) return val;
      return decrypt(val);
    }
  }
  
  // Register the type with mongoose
  mongoose.Schema.Types.EncryptedString = EncryptedString;
  
  return EncryptedString;
};

module.exports = {
  encrypt,
  decrypt,
  createEncryptedSchemaType
};