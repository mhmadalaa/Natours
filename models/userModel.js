const mongoose = require('mongoose');
const { default: isEmail } = require('validator/lib/isEmail');

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
  photo: String,
  password: {
    type: String,
    required: [true, 'User must have a password'],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    minlength: 8,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;

/*

{
  name: mhmad alaa
  email: malaa@gmail.com
  photo: "user.jpg"
  password: 12341234
  passwordConfirm: 12341234
}

*/