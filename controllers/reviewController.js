const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./factoryHandler');





exports.setUserTourId = (req, res, next) => {
    if(!req.body.user)
        req.body.user = req.user.id;

    if(!req.body.tour)
        req.body.tour = req.params.tourId;
    next();
}

exports.getAllReviews = factory.readAll(Review);
exports.getReview = factory.readOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);