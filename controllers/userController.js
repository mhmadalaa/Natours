const User = require('./../models/userModel');

exports.getAllUsers = async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    users,
  });
};

exports.createUser = async (req, res) => {
  const user = await User.create(req.body);

  res.status(200).json({
    status: 'success',
    message: user,
  });
};

exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    user,
  });
};

exports.updateUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, req.body);
  const user = await User.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    user,
  });
};

exports.deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: `user ${user.name} is deleted successfully.`,
  });
};
