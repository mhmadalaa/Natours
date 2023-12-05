const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./reviewRoute');

const router = express.Router();

// check is login for all routers
router.use(authController.protect);

// reviews for specific tour, and let use review router for it
router.use('/:tourId/reviews/', reviewRouter);

router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/top-5-cheap')
  .get(tourController.topTours, tourController.getAllTours);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(
    authController.restrictTo('guide', 'lead-guide', 'admin'),
    tourController.createTour,
  );

router
  .route('/:id/')
  .get(tourController.getTourById)
  .patch(
    authController.restrictTo('guide', 'lead-guide', 'admin'),
    tourController.updateTour,
  )
  .delete(
    authController.restrictTo('lead-guide', 'admin'),
    tourController.deleteTour,
  );

module.exports = router;
