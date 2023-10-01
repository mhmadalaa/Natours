const express = require('express');
const tourController = require('./../controllers/tourController');

const router = express.Router();

router.param('id', tourController.checkID);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    tourController.checkBody,
    tourController.postNewTour
  )
  .patch(tourController.testPatch);

router
  .route('/:id/')
  .get(tourController.getTourById)
  .delete(tourController.testDelete);

module.exports = router;
