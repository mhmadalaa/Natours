const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    users,
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(200).json({
    status: 'success',
    message: user,
  });
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
  let user = await User.findByIdAndUpdate(req.params.id, req.body);

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
