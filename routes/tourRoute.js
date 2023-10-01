const express = require('express');
const tourController = require('./../controllers/tourController');

const router = express.Router();

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.postNewTour)
  .patch(tourController.testPatch);

router
  .route('/:id')
  .get(tourController.getTourById)
  .delete(tourController.testDelete);

module.exports = router;
