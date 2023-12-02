const express = require('express');

const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/create-review').post(reviewController.createReview);
router.route('/get-reviews').get(reviewController.getAllReviews);
router.route('/get-review/:id').get(reviewController.getReviewById);

// for the logged in user
router
  .route('/get-user-reviews/')
  .get(authController.protect, reviewController.getUserReviews);

router.get('/get-tour-reviews/:id', reviewController.getTourReview);

router.get('/get-tour-rate/', reviewController.getReveiwByRate);

module.exports = router;
