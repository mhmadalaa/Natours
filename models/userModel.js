const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { default: isEmail } = require('validator/lib/isEmail');
const hashToken = require('../utils/hashToken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User must have a name'],
    unique: [true, 'User name must be unique'],
    trim: true,
    minlength: [5, 'User name must be at least 5 characters'],
    maxlength: [15, 'User name must be at most 15 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: {
      validator: isEmail,
      message: 'Enter a valid email',
    },
  },
  photo: {
    type: String, 
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'User must have a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    minlength: 8,
    validate: {
      // this validator function only works with ""SAVE""
      // so we need to use save in case of update or similars
      validator: function (val) {
        return this.password === val;
      },
      message: 'Please, check if password is the same.',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailResetToken: String,
  emailResetExpires: Date,
  emailCofirmToken: String,
  emailConfirmExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  authenticated: {
    type: Boolean,
    default: true,
    // select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; // to be deleted after check if it's equal
  this.passwordChangedAt = Date.now() - 1000;

  next();
});

userSchema.pre(/^find/, async function (next) {
  this.find({ active: { $ne: false } });

  next();
});

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    return parseInt(this.passwordChangedAt.getTime() / 1000) > JWTTimestamp;
  }

  return false;
};

userSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = hashToken(resetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.createEmailResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.emailResetToken = hashToken(resetToken);

  this.emailResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.createEmailConfirmToken = function () {
  const confirmToken = crypto.randomBytes(32).toString('hex');

  this.emailCofirmToken = hashToken(confirmToken);

  this.emailConfirmExpires = Date.now() + 10 * 60 * 1000;

  return confirmToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
