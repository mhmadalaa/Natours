const express = require('express');

const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./reviewRoute');

const router = express.Router();

// user given reviews
router.use('/user/', reviewRouter);

router.post('/signup', authController.signup);

router.patch('/confirm-signup/:confirmToken', authController.confirmSignup);

router.post('/login', authController.login);

router.patch(
  '/update-password',
  authController.protect,
  authController.updatePassword,
);

router.post('/forgot-password', authController.forgetPassword);

router.patch('/reset-password/:resetToken', authController.resetPassword);

router.post(
  '/change-email',
  authController.protect,
  authController.changeEmail,
);
router.patch(
  '/reset-email/:resetToken',
  authController.protect,
  authController.resetEmail,
);

router.patch(
  '/update-user',
  authController.protect,
  userController.uploadUserPhoto,
  userController.updateUser,
);

router.delete(
  '/delete-user',
  authController.protect,
  userController.deleteUser,
);

// FIXME: THESE ROUTERS JUST FOR DEBUGGING, NOT READY YET FOR PRODUCTION USEAGE
router.route('/').get(userController.getAllUsers);
router.route('/:id').get(userController.getUser);

module.exports = router;
