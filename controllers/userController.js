const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const userSanitize = require('./../utils/userSanitize');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    users,
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  req.user = await User.create(userSanitize(req.body));

  next();
});

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

exports.updateUser = catchAsync(async (req, res, next) => {
  let user = await User.findByIdAndUpdate(
    req.params.id,
    userSanitize(req.body),
  );

  if (!user) {
    next(new AppError(`user of this id: ${req.params.id} is not found!`));
    return;
  }

  user = await User.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    user,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    next(new AppError(`user of this id: ${req.params.id} is not found!`));
    return;
  }

  res.status(200).json({
    status: 'success',
    message: `user ${user.name} is deleted successfully.`,
  });
});
