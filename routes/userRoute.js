const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/signup').post(userController.createUser, authController.signup);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser, authController.signup);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
