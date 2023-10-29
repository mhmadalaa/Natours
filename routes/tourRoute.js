const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/top-5-cheap')
  .get(tourController.topTours, tourController.getAllTours);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('guide', 'lead-guide', 'admin'),
    tourController.createTour,
  );

router
  .route('/:id/')
  .get(tourController.getTourById)
  .patch(
    authController.protect,
    authController.restrictTo('guide', 'lead-guide', 'admin'),
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('lead-guide', 'admin'),
    tourController.deleteTour,
  );

module.exports = router;
