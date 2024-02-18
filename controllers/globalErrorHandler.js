const AppError = require('./../utils/appError');
const sendErrorDevelopment = (err, req, res) => {
    if(req.originalUrl.startsWith('/api'))
    {
        return res.status(err.statusCode).json({
            status: err.status,
            statusCode: err.statusCode,
            message: err.message,
            error: err,
            stack: err.stack
        });
    }
    return res.status(err.statusCode).render('error', {
        title: 'Error Occured',
        msg: err.message
    })
}

const sendErrorProduction = (err, req, res) => {


    // if this error is operational : means user can see the error that he made not comming from us as a programmers
    if(err.isOperational)
    {
        if(req.originalUrl.startsWith('/api'))
        {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            })
        }
        return res.status(err.statusCode).render('error', {
            title: 'Error Occured',
            msg: err.message
        })
    }
    // other wise he should see that it was an error we need to fix  weather it is from us as a programmers or we forgot to mark it as an operational error

    // we then output the error to us to see it
    console.error('Error Happened: ', err);
    // we then send our response to user
    if(req.originalUrl.startsWith('/api'))
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    res.status(500).render('error', {
        title: 'Error Occured',
        msg: 'Please, try again later.'
    })
    
}

function handleCastError(err){
    const message = `Invalid ${err.path} = ${err.value}`;
    return new AppError(message, 400);
}

function handleDuplicateFieldError(err){
    const message = `dublicate ${Object.keys(err.keyValue)} : ${Object.values(err.keyValue)}, please use another value`;
    return new AppError(message, 400)
}

function handleValidationErrorDB(err){
    const keys = Object.keys(err.errors);
    let message = err.errors[keys[0]];
    keys.shift();
    keys.forEach(data => message += `, ${err.errors[data].message}`);
    return new AppError(message, 400);
}

function handleTokenSignatureError(){
    return new AppError('Token signature error, please login again to have access.', 401);
}

function handleTokenExpiredError(){
    return new AppError('Token Expired, please login again to have access.', 401);
}

const globalErrorHandler = (err, req, res, next) => {
    err.status = err.status || 'error';
    err.statusCode = err.statusCode || 500;
    if(process.env.NODE_ENV === 'development')
        sendErrorDevelopment(err, req, res);
    else if(process.env.NODE_ENV === 'production')
    {
        let error = {...err};
        error.message = err.message;
        if(err.name === 'CastError') error = handleCastError(error);
        if(err.code === 11000) error = handleDuplicateFieldError(error);
        if(err.name === 'ValidationError')   error = handleValidationErrorDB(error);
        if(err.name === 'TokenExpiredError') error = handleTokenExpiredError();
        if(err.name === 'JsonWebTokenError') error = handleTokenSignatureError();
        sendErrorProduction(error, req, res);
    }
}

module.exports = globalErrorHandler;