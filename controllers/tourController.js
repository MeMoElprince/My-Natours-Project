const Tour = require('./../models/tourModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./factoryHandler');
const multer = require('multer');
const sharp = require('sharp');


const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if(file.mimetype.split('/')[0] === 'image')
  {
      cb(null, true);
  }
  else
  {
      cb(new AppError('File should be an image..', 400), false);
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})

exports.resizeTourPics = catchAsync(async (req, res, next) => {
  if(!req.files.imageCover || !req.files.images) return next();

  // 1) imageCover
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-image-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer).resize(2000, 1333).toFormat('jpeg').jpeg({quality: 90}).toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) images
  req.body.images = [];
  await Promise.all(req.files.images.map(async (el, i) => {
    const imageName = `tour-${req.params.id}-${Date.now()}-${i}.jpeg`;
    await sharp(el.buffer).resize(2000, 1333).toFormat('jpeg').jpeg({quality: 90}).toFile(`public/img/tours/${imageName}`);
    req.body.images.push(imageName);
  }));

  next();
});

exports.uploadTourPics = upload.fields([
  {name: 'imageCover', maxCount: 1},
  {name: 'images', maxCount: 3}
])



exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage price name';
  req.query.fields = 'name price ratingsAverage ratingsQuantity duration startDates difficulty';
  next();
}

  // tours   /tours-within/distance/:distance/coordinates/:coordinates/unit/:unit 
  // tours   /tours-within/distance/400/coordinates/34.111745,-118.113491/unit/mi

exports.toursWithin = catchAsync(async (req, res, next) => {
    const {distance, coordinates, unit} = req.params;
    const [lat, lng] = coordinates.split(',');
    if(!distance || !coordinates || !unit || !lat || !lng)
      return next(new AppError('Unvalid parameters in the request!!!', 400));

    // unit could be mi or km 
    // we change our distance from it's unit to the radius of the earth
    const radius = unit === 'mi' ? distance / 3963.1676 : distance / 6371.0
    const tours = await Tour.find({
      startLocation: {
        $geoWithin: {
          $centerSphere: [[lng, lat], radius]
        }
      }
    });
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours
      }
    })
});

exports.toursDistance = catchAsync(async (req, res, next) => {
  const {coordinates, unit} = req.params;
  const [lat, lng] = coordinates.split(',');
  if(!coordinates || !unit || !lat || !lng)
    return next(new AppError('Unvalid parameters in the request!!!', 400));

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng*1, lat*1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      data: distances
    }
  })

});

exports.getAllTours = factory.readAll(Tour);
exports.getTour = factory.readOne(Tour, {path: 'reviews'});
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);