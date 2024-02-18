const {promisify} = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const jwtSign = require('./../utils/jwtGeneration');
const Email = require('./../utils/email');

function sendTokenResponse(user,statusCode, res, isNull = false){
    const token = jwtSign({id: user._id});
    const cookieOptions = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };
    if(process.env.NODE_ENV === 'production')
        cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);
    const response = {
        status: "success",
        token
    };
    if(!isNull)
        response.user = user;
    res.status(statusCode).json(response);
}


exports.signup = catchAsync(async (req, res, next) => {
    const changedPasswordDate = req.body.changedPasswordDate || undefined;
    const role = req.body.role || undefined;

    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm, 
        changedPasswordDate,
        role
    });
    await new Email(newUser, `${req.protocol}://${req.get('host')}/me`).sendWelcome();

    sendTokenResponse(newUser, 201, res, 0);
});


exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;
     
    // 1) check if there is an email provided and a password
    if(!email || !password)
        return next(new AppError('There must be an email and password to continue...', 400));
    // 2) check if email and passwords are correct
    const user = await User.findOne({email}).select('+password');
    if(!user || ! (await user.correctPassword(password, user.password)))
        return next(new AppError('Wrong email or password!!..', 400));
    // 3) generate the JWT 
    sendTokenResponse(user, 203, res, 1);
});

exports.logout = catchAsync(async (req, res, next) => {
    res.cookie('jwt', 'logging out', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })
    res.status(200).json({
        status: 'success'
    })
})


exports.protect = catchAsync(async (req, res, next)=>{
    // 1) If there is a token provided
    let token = undefined;
    if(req.headers.authorization && (req.headers.authorization.startsWith('bearer') || req.headers.authorization.startsWith('Bearer')))
        token = req.headers.authorization.split(' ')[1];
    else if(req.cookies.jwt)
        token = req.cookies.jwt;
    if(!token)
        return next(new AppError('You are not logged in, please login to have access.', 401));

    // 2) Verify token 
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Doesn't this user exist ?
    const currentUser = await User.findOne({_id: decoded.id}).select('+changedPasswordDate');
    if(!currentUser)
        return next(new AppError('This user is no longer exist', 401));

    // 4) Did this user change his password after the this token created ?
    const isChangedPassword = currentUser.isChangedPassword(decoded.iat);
    if(isChangedPassword)
        return next(new AppError('This user changed his password, please login again to have access.', 401));

    // grant access to protected route
    res.locals.user = currentUser;
    req.user = currentUser;
    next();
});


exports.isLoggedIn = async (req, res, next)=>{
    // 1) If there is a token provided
    try{
        let token = undefined;
        if(req.cookies.jwt)
            token = req.cookies.jwt;
        if(!token)
            return next();
    
        // 2) Verify token 
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    
        // 3) Doesn't this user exist ?
        const currentUser = await User.findOne({_id: decoded.id}).select('+changedPasswordDate');
        if(!currentUser)
            return next();
    
        // 4) Did this user change his password after the this token created ?
        const isChangedPassword = currentUser.isChangedPassword(decoded.iat);
        if(isChangedPassword)
            return next();
    
        // grant access to protected route
        res.locals.user = currentUser;
        return next();
    } catch(err){
        next();
    }
};





exports.ristrictTo = (...roles) => {
    return (req, res, next) => {
      const role = req.user.role;
      if(!roles.includes(role))
        return next(new AppError('You have no permition to do that !!', 403));
      next();
    }
  }

exports.forgetPassword = catchAsync(async(req, res, next) => {
    // 1) get the user bases on the email provided
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user)
        return next(new AppError('This email is invalid!!!', 404));
    // 2) generating a secret token to him and keeping it in our database for 10 minutes
    const passwordResetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});
    // 3) sending this token to the email provided
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${passwordResetToken}`;
    try{
        await new Email(user, resetUrl).sendResetPassword();
        res.status(200).json({
            status : "success",
            message: "email reset sent successfully ..."
        });
    } catch(err)
    {
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;
        await user.save({validateBeforeSave: false});
        return next(new AppError('error happened didn\'t send any reset password', 500));
    }
});

exports.resetPassword = catchAsync(async(req, res, next) => {
    // 1) i will recive token i sould find this user and see if he can change his password
    //    - by checking if there a user with this token and buy looking at the expires date
    //    ------- don't forget to encrypt the token
    const tokenHashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({passwordResetToken: tokenHashed, passwordResetTokenExpires: {$gt: Date.now()}});
    if(!user)
        return next(new AppError('Token is invalid or expired!!', 400));
    // 2) change the changedPasswordAt time    in userModel
    // 3)change user password 
    const {password, passwordConfirm} = req.body;
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save();

    // 4) create a token to login the user
    sendTokenResponse(user, 200, res, 1);
});

exports.updatePassword = catchAsync(async(req, res, next) => {
    // 1) Get user from our collection
    const user = await User.findById(req.user.id).select('+password');
    // 2) Check if the provided password is correct or not 
    if(!(await user.correctPassword(req.body.currentPassword, user.password)))
        return next(new AppError('Wrong password!!!', 401));
    // ofcourse changing passwordChangedDate will automaticlly changed by saving
    // 3) update the user settings 
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // 4) log in user and generate his new token
    sendTokenResponse(user, 201, res, 1);
});