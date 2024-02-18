const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./factoryHandler');
const multer = require('multer');
const sharp = require('sharp');

// obj = req.body
// ...data = 'email' 'name'


// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     // user-dgs3ggdsg23232-23232131.jpeg
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// })

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if(file.mimetype.split('/')[0] === 'image'){
    cb(null, true);
  } else {
    cb(new AppError('File should be an image..', 400), false);
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if(!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({quality: 90}).toFile(`public/img/users/${req.file.filename}`);
  next();
});

exports.uploadUserPhoto = upload.single('photo');

function filteredObj(obj, ...data){
  let newObj = {};
  Object.keys(obj).forEach(el => {
    if(data.includes(el))
    {
        newObj[el] = obj[el];
    }
  })
  return newObj;
}

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {active: false});
  res.status(204).json({
    status: "success",
    data: null
  })
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) check if the data comming has password
  if(req.body.password || req.body.passwordConfirm)
    return next(new AppError('Bad route for changing password. please, use the correct one', 400));

  // 2) updating the user data 
  const data = filteredObj(req.body, 'name', 'email');
  if(req.file)
    data.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, data, {new: true, runValidators: true});
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  })
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
}


exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined!... please use /signup one'
  });
};

exports.getAllUsers = factory.readAll(User);
exports.getUser = factory.readOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
