const express = require('express');

const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/:tourId/reviews/')
  .post(authController.restrictTo('user'), reviewController.createReview)
  .get(reviewController.getTourReviews);

router.route('/:tourId/reviews/:rate').get(reviewController.getReveiwByRate);

// FIXME: when express match the url, it always match the parameter with the path
//       so if it may make error like the upcoming two routers you should but
//       the one which not started with parameter first
// user given reviews
router
  .route('/user/')
  .get(authController.protect, reviewController.userReviews);

router
  .route('/:reviewId')
  .get(reviewController.getReviewById)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview,
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview,
  );

// FIXME: DEBUGGING REOUTER
router.route('/').get(reviewController.getAllReviews);

module.exports = router;
