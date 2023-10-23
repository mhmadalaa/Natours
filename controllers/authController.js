const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');

const getUserJWT = (user) => {
  return jwt.sign({ id: user._id.valueOf() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const token = getUserJWT(req.user);

  res.status(201).json({
    status: 'success',
    token: token,
    user: req.user,
  });
});
