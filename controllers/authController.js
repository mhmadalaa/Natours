const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

const getUserJWT = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const isValidUser = async (email, password) => {
  const user = await User.findOne({ email: email }).select('+password');
  let correct = false;
  if (user !== null) {
    correct = await user.correctPassword(password, user.password);
  }

  if (!correct) {
    return undefined;
  }

  return user;
};

exports.signup = catchAsync(async (req, res, next) => {
  const token = getUserJWT(req.user._id.valueOf());

  res.status(201).json({
    status: 'success',
    token: token,
    user: req.user,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  let token = '';
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  } else if (email && password) {
    const validUser = await isValidUser(email, password);

    if (!validUser) {
      return next(new AppError('Un valid email or password!', 401));
    }

    token = getUserJWT(validUser._id);
  }

  res.status(200).json({
    status: 'success',
    token,
  });
});
