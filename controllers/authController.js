const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const AppError = require('../utils/appError');
const userSanitize = require('../utils/userSanitize');
const sendEmail = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
const { promisify } = require('util');
const hashToken = require('../utils/hashToken');

const getUserJWT = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const isValidUser = async (email, password) => {
  const user = await User.findOne({ email: email }).select(
    '+password',
  );

  if (!user || !(await user.correctPassword(password)) || !user.authenticated) {
    return undefined;
  }

  return user;
};

const createSendJWTToken = (user, statusCode, message, res) => {
  const token = getUserJWT(user.id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;
  user.active = undefined;

  res.status(statusCode).json({
    status: 'success',
    message: message,
    token: token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // create a user but marked as not authenticated
  const user = await User.create(userSanitize(req.body));
  user.authenticated = false;

  // Generate random confirm token
  const confirmToken = user.createEmailConfirmToken();
  user.save({ validateBeforeSave: false });

  // Send confirm token to user email
  try {
    await sendEmail({
      email: 'mhmadalaa666@gmail.com',
      subject: 'Email Confirm',
      message: `That's a 10 minutes valid token ${confirmToken} to Confirm your Email`,
    });

    res.status(200).json({
      status: 'success',
      message: 'An email will be send to complete the steps',
      // FIXME: the confirm token shouldn't be returned to the client with the response
      // it must be returned in a trusted place which the correct user have access to
      // aka the `email`
      confirmToken,
    });
  } catch (err) {
    await User.findByIdAndDelete(user._id);

    return next(
      new AppError(
        'There is an error while sending the email, pleas signup again!',
        500,
      ),
    );
  }
});

exports.confirmSignup = catchAsync(async (req, res, next) => {
  // encrypt the token to match the saved one
  const hashedToken = hashToken(req.params.confirmToken);

  // find the user by token and not exceded the expires date
  const user = await User.findOne({
    emailCofirmToken: hashedToken,
    emailConfirmExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalide or has been expired!', 400));
  }

  // authenticate the created user before as a regular user
  user.authenticated = true;
  user.emailCofirmToken = undefined;
  user.emailConfirmExpires = undefined;
  await user.save({ validateBeforeSave: false });

  createSendJWTToken(user, 201, 'User Create.', res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  } else if (email && password) {
    const validUser = await isValidUser(email, password);

    if (!validUser) {
      return next(new AppError('Un valid email or password!', 401));
    }

    createSendJWTToken(validUser, 200, 'User Login.', res);
  }
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
      if (!roles.includes(req.user.role)) {
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

// FORGOT AND REST PASSWORD IS FOR CHANGING THE PASSWORD THAT THE USER CAN'T REMEMBER
exports.forgetPassword = catchAsync(async (req, res, next) => {
  // Get user based on his email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address!'));
  }

  // Generate random reset token
  const resetToken = user.createPasswordResetToken();
  user.save({ validateBeforeSave: false });

  // Send reset token to user's email
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
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // encrypt the token to match the saved one
  const hashedToken = hashToken(req.params.resetToken);

  // find the user by token and not exceded the expires date
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // update the password or return an error if exist
  if (!user) {
    return next(new AppError('Token is invalide or has been expired!', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  if (user.password && user.password === user.passwordConfirm) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
  } else {
    return next(
      new AppError('Password is invalide or not match the confirmation', 400),
    );
  }

  // login the user again
  createSendJWTToken(user, 200, 'Password Reset', res);
});

// UPDATE THE PASSWORD FOR THE LOGEDIN USER WHO REMEMBER THE CURRENT PASSWORD
exports.updatePassword = catchAsync(async (req, res, next) => {
  // Get the logged in user from db
  const user = await User.findById(req.user._id).select('+password');

  // Check if the sended password is correct
  if (!user || !(await user.correctPassword(req.body.password))) {
    return next(new AppError('This password is incorrect, try again.', 400));
  }

  // update the password
  if (req.body.newPassword === req.body.newPasswordConfirm) {
    user.password = req.body.newPassword;
    user.save({ validateBeforeSave: false });
  } else {
    return next(
      new AppError('Password is invalide or not match the confirmation', 400),
    );
  }

  // login the user again
  createSendJWTToken(user, 200, 'Password Updated', res);
});

exports.changeEmail = catchAsync(async (req, res, next) => {
  // Get the logged in user from db
  const user = await User.findById(req.user._id);

  // Generate random reset token
  const resetToken = user.createEmailResetToken();
  user.save({ validateBeforeSave: false });

  // Send reset token to user's email
  try {
    await sendEmail({
      email: 'mhmadalaa666@gmail.com',
      subject: 'Email Reset',
      message: `That's a 10 minutes valid token ${resetToken} copy it to change your Email`,
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
    user.emailResetToken = undefined;
    user.emailResetExpires = undefined;
    user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There is an error when sending the email, pleas try again!',
        500,
      ),
    );
  }
});

exports.resetEmail = catchAsync(async (req, res, next) => {
  // encrypt the token to match the saved one
  const hashedToken = hashToken(req.params.resetToken);

  // find the user by token and not exceded the expires date
  const user = await User.findOne({
    emailResetToken: hashedToken,
    emailResetExpires: { $gt: Date.now() },
  });

  // update the password or return an error if exist
  if (!user) {
    return next(new AppError('Token is invalide or has been expired!', 400));
  }

  user.email = req.body.email;
  if (user.email) {
    user.emailResetToken = undefined;
    user.emailResetExpires = undefined;

    await user.save({ validateBeforeSave: false });
  } else {
    return next(new AppError('Provide a valid email.', 400));
  }

  // login the user again
  createSendJWTToken(user, 200, 'Email Reset', res);
});
