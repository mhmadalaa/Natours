const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', userController.createUser, authController.signup);
router.post('/login', authController.login);

router.post('/forgot-password', authController.forgetPassword);
router.patch('/reset-password/:resetToken', authController.resetPassword); 

// FIXME: THESE ROUTES JUST FOR DEBUGGING, NOT READY YET FOR PRODUCTION USEAGE
router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
