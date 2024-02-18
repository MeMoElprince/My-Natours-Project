const stripe = require('stripe')(process.env.STRIPE_SECRET);

const Tour = require('./../models/tourModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./factoryHandler');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');

exports.checkout = catchAsync(async (req, res, next) => {
    // 1) get the tour we want to parchase  
    const tour = await Tour.findById(req.params.tourId);

    // 2) we create a checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
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

const createBookingCheckout = async session => {
    const tour = session.client_reference_id;
    const user = (await User.findOne({email: session.customer_email}))._id;
    const price = session.line_items[0].price_data.unit_amount / 100;
    await Booking.create({
        tour,
        user,
        price
    });
}

exports.checkoutSuccess = (req, res, next) => {
    const signature = req.headers['stripe-signature'];
    let event;
    try{
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch(err) {
        return res.status(400).send(`WebHook error: ${err.message}`);
    }

    if(event.type === 'checkout.session.completed')
        createBookingCheckout(event.data.object);

    res.status(200).json({
        received: true
    })

}

// exports.addCheckout = catchAsync(async (req, res, next) => {
//     const {price, tourId, userId} = req.query;
//     if(!price || !tourId || !userId) return next();
//     await Booking.create({
//         tour: tourId,
//         user: userId,
//         price
//     });
//     res.redirect(req.originalUrl.split('?')[0]);
// });


exports.getAllBookings = factory.readAll(Booking);