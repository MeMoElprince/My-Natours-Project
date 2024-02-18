const mongoose = require('mongoose');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema({
      name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true
      },
      ratingsAverage: {
        type: Number,
        default: 4.5,
        set: num =>  Math.round(num * 10) / 10
      },
      ratingsQuantity: {
        type: Number,
        default: 0
      },
      images: {
        type: [String],
      },
      imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
      },
      createdAt: {
        type: Date,
        default: Date.now(),
        select: false
      },
      summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a summary'],
      },
      description: {
        type: String,
        trim: true,
      },
      duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
      },
      startDates: {
        type: [Date],
      },
      maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
      },
      priceDiscount: {
        type: Number,
      },
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'difficult'],
        required: [true, 'A tour must have a difficulty']
      },
      price: {
        type: Number,
        required: [true, 'A tour must have a price']
      },
      startLocation: {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
      },
      locations: [
        {
          type: {
            type: String,
            default: 'Point',
            enum: ['Point']
          },
          coordinates: [Number],
          address: String,
          description: String,
          day: Number
        }
      ],
      guides: [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'User'
        }
      ]
},
{
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});


// use indexex in our schema
tourSchema.index({price:1, ratingAverages: -1});

// for geospatial data 
tourSchema.index({startLocation: '2dsphere'});

tourSchema.virtual('durationTimeInWeaks').get(function(){
  return this.duration / 7;
});
// creating virtual 
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// ducument middleware 


// empeding      bad for this app
// tourSchema.pre('save', async function(next){
//   const guides = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guides);
//   next();
// });

// query middleware 

// populating users (guides)
tourSchema.pre(/^find/, function(next){
  this.populate({
    path: 'guides',
    select: '-__v -changedPasswordDate'  
  });
  next();
});
  
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;