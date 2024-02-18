const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty!!']
    },
    rating: {
        type: Number,
        required: [true, 'Rating can not be empty!!'],
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review should has a tour!!']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review should has a user!!']
    }
},
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

reviewSchema.statics.calcAverageRatings = async function(tourId){
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: tourId,
                nRating: {$sum : 1},
                ratingAvg: {$avg: '$rating'}
            }
        }
    ]);
    if(stats.length > 0)
    {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage : stats[0].ratingAvg
        });
    }
    else
    {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage : 4.5
        });
    }
};



reviewSchema.pre(/^find/, function(next){
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next(); 
}); 

reviewSchema.index({tour: 1, user: 1}, {unique: true});


// after every save for a review   we need to update tour ratings and quantity
reviewSchema.post('save', async function(){
    await this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function(next){
    this.r = await this.clone().findOne();
    next(); 
});
reviewSchema.post(/^findOneAnd/, async function(){
    await this.r.constructor.calcAverageRatings(this.r.tour);
});


const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;