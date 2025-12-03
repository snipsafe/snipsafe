const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  organization: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  authProvider: {
    type: String,
    enum: ['local', 'azure_ad'],
    default: 'local'
  },
  azureId: {
    type: String,
    sparse: true
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  // Don't hash password for Azure AD users
  if (this.authProvider === 'azure_ad') {
    return next();
  }
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  if (this.authProvider === 'azure_ad') {
    throw new Error('Password comparison not supported for Azure AD users');
  }
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
