const express = require('express');
const router = express.Router();
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');
const bookingController = require('../controllers/bookingController');




router.get('/', bookingController.addCheckout, authController.isLoggedIn, viewController.getOverview);
router.get('/tour/:id', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.login);
router.get('/signup', viewController.signup);
router.get('/me', authController.protect, viewController.account);
router.get('/my-tours', authController.protect, viewController.myTours);

router.post('/update-user-route', authController.protect, viewController.updateMyData);

module.exports = router;