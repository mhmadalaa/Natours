const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
// const userSanitize = require('./../utils/userSanitize');
const updateUserSanitize = require('../utils/updateUserSanitize');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    users,
  });
});

// exports.createUser = catchAsync(async (req, res, next) => {
//   req.user = await User.create(userSanitize(req.body));

//   next();
// });

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    next(new AppError(`user of this id: ${req.params.id} is not found!`));
    return;
  }

  res.status(200).json({
    status: 'success',
    user,
  });
});

// The user can only update any field rather than [password, email, role] with this function,
// the other fields need a special routers and functionis to handle
exports.updateUser = catchAsync(async (req, res, next) => {
  if (
    req.body.password ||
    req.body.passwordConfirm ||
    req.body.email ||
    req.body.role
  ) {
    return next(new AppError('This route not for updating crucial data!'));
  }

  // Update user document
  const filteredBody = updateUserSanitize(req.body);
  const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    user,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  user.active = false;
  user.save({ validateBeforeSave: false });

  // 204 status doesn't retutrn a content of response
  res.status(204).json({
    status: 'success',
    message: `user ${user.name} is deleted successfully.`,
  });
});
