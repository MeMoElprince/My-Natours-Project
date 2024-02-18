const stripe = require('stripe')(process.env.STRIPE_SECRET);

const Tour = require('./../models/tourModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./factoryHandler');
const Booking = require('../models/bookingModel');

exports.checkout = catchAsync(async (req, res, next) => {
    // 1) get the tour we want to parchase  
    const tour = await Tour.findById(req.params.tourId);

    // 2) we create a checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}?tourId=${tour._id}&userId=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour._id}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items:[
            {
                price_data: {
                  currency: 'EGP',
                  product_data: {
                    name: `${tour.name} Tour`,
                  },
                  unit_amount: tour.price * 100, // in cents
                },
                quantity: 1,
            },
        ],
        mode: 'payment'
    })
    // 3) create a session as response
    res.status(200).json({
        status: 'success',
        session
    })
});

exports.addCheckout = catchAsync(async (req, res, next) => {
    const {price, tourId, userId} = req.query;
    if(!price || !tourId || !userId) return next();
    await Booking.create({
        tour: tourId,
        user: userId,
        price
    });
    res.redirect(req.originalUrl.split('?')[0]);
});


exports.getAllBookings = factory.readAll(Booking);