const multer = require('multer');
const sharp = require('sharp');

const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
// const userSanitize = require('./../utils/userSanitize');
const updateUserSanitize = require('../utils/updateUserSanitize');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! please upload only images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // when using multer memorysotrage it doens't add filename
  // so we should add it manually to fit with the other functions
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // when uploading files and will do operations to it
  // using multer middleware, it's better to keep it in
  // memory rather than to disk directly
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

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
  if (req.file) filteredBody.photo = req.file.filename;

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
