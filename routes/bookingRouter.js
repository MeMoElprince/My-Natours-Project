const express = require('express');
const authController = require('./../controllers/authController');
const bookingController = require('../controllers/bookingController');
const router = express.Router();


router.get('/check-out/:tourId', authController.protect, bookingController.checkout);


router.route('/').get(authController.protect, authController.ristrictTo('admin', 'lead-guide'), bookingController.getAllBookings);

module.exports = router;