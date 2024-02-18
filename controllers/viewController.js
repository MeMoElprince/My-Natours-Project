const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');

exports.getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();
    
    res.status(200).render('overview', {
      title: 'Overview Page',
      tours
    })
});

exports.getTour = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const tour = await Tour.findById(id).populate({
        path: 'reviews',
        select: 'review user rating -tour'
    });
    if(!tour)
        return next(new AppError('No tour found...', 404));
    res.status(200).render('tour', {
        title: 'Tour details',
        tour
    })
});

exports.login = (req, res) => {
    res.status(200).render('login',{
        title: 'Log into your acount'
    });
};

exports.signup = (req, res) => {
    res.cookie('jwt', 'logging out', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })
    
    res.status(200).render('signup', {
        title: 'Signup'
    });
}

exports.account = (req, res) => {
    res.status(200).render('account', {
        title: 'Your profile'
    })
}

exports.updateMyData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    }, {
        new: true,
        runValidators: true
    });
    res.status(200).render('account', {
        title: 'Your profile',
        user: updatedUser
    })
});


exports.myTours = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({user: req.user.id});
    const tourIds = bookings.map(el => el.tour);
    const tours = await Tour.find({_id: {$in : tourIds}});
    res.status(200).render('overview', {
        tours
    })
});