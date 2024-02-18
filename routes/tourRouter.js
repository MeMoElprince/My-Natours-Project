const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRouter');
const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-tours')
  .get(tourController.aliasTopTours, tourController.getAllTours);
  
  // tours   /tours-within/distance/:distance/coordinates/:coordinates/unit/:unit 
  // tours   /tours-within/distance/400/coordinates/34.111745,-118.113491/unit/mi
router.route('/tours-within/distance/:distance/coordinates/:coordinates/unit/:unit').get(tourController.toursWithin);
router.route('/tours-distances/coordinates/:coordinates/unit/:unit').get(tourController.toursDistance);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(authController.protect, authController.ristrictTo('admin', 'lead-guide'), tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authController.protect, authController.ristrictTo('admin', 'lead-guide'), tourController.uploadTourPics, tourController.resizeTourPics, tourController.updateTour)
  .delete(authController.protect, authController.ristrictTo('admin', 'lead-guide'), tourController.deleteTour);

// api/v1/tours/ :id     / reviews

module.exports = router;
