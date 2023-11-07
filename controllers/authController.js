const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
const { promisify } = require('util');

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

exports.protect = catchAsync(async (req, res, next) => {
  // get the token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }

  // check if a valid token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // check if user of that token still exists
  const existingUser = await User.findById(decoded.id);

  if (!existingUser) {
    return next(
      new AppError('The user belongs to this token no longer exists!', 401),
    );
  }

  // check if user changed his password after the token issued
  const passwordChanged = existingUser.changedPasswordAfter(decoded.iat);
  if (passwordChanged) {
    return next(
      new AppError('This user changes his password, please login again.', 401),
    );
  }

  // send user data with the request object
  req.user = existingUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // 'req.user' here is very important
    // as it comes from 'protect' pre middleware
    // so it must be authenticated to get authorization permissions
    try {
      if (!roles.includes(req.user.roles)) {
        return next(
          new AppError(
            'This user does not have the right to do this operation!',
            403,
          ),
        );
      }
    } catch (err) {
      return next(new AppError('This user must be authenticated first!', 401));
    }

    next();
  };
};

exports.forgetPassword = async (req, res, next) => {
  // 1. Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address!'));
  }

  // 2. Generate random reset token
  const resetToken = user.createPasswordResetToken();
  user.save({ validateBeforeSave: false });

  // 3. Send it to user's email
  try {
    await sendEmail({
      email: 'mhmadalaa666@gmail.com',
      subject: 'Password Reset',
      message: `That's a 10 minutes valid token ${resetToken} copy it to change your password`,
    });

    res.status(200).json({
      status: 'success',
      message: 'An email will be send to complete the steps',
      // FIXME: the reset token shouldn't be returned to the client with the response
      // it must be returned in a trusted place which the correct user have access to
      // aka the `email`
      resetToken,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There is an error when sending the email, pleas try again!',
        500,
      ),
    );
  }
};

exports.resetPassword = (req, res, next) => {
  // FIXME: just for testing the route
  res.status(200).json({
    'reset-token': req.params,
    body: req.body,
    jwt: req.headers.cookie,
  });
};
