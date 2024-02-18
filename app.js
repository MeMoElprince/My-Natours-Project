const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const sanatizeMongo = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

/*
EMAIL_FROM=mostafahaz120@gmail.com
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_USER=607adb60edba68
EMAIL_PASSWORD=43f7ef0d4148a3
EMAIL_PORT=2525
*/
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/globalErrorHandler');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const viewRouter = require('./routes/viewRouter');
const bookingRouter = require('./routes/bookingRouter');

const app = express();


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GlOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // for loading any scripts default one i see
    referrerPolicy: false, // when it is true i get invalid authentication while using map for loading the rest of images 
    // crossOriginOpenerPolicy: false,
    // crossOriginEmbedderPolicy: false,
    // xPoweredBy: false,
    // xPermittedCrossDomainPolicies: false,
    // xFrameOptions: false,
    // xDownloadOptions: false,
    // xDnsPrefetchControl: false,
    // strictTransportSecurity: false,
    // xContentTypeOptions: false,
    // originAgentCluster: false,
    // crossOriginResourcePolicy: false,
    // xXssProtection: false
  }),
);

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many request from this Ip adress, please try again in an hour.'
});
app.use('/api', limiter);


// app.use(cors());

// Body parser, reading data from body into req.body
app.use(express.json({limit: '10kb'}));
app.use(express.urlencoded({extended: true, limit: '10kb'}));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(sanatizeMongo());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: [
    'duration'
  ]
}));

app.use(compression());
// Test middleware 
// app.use((req, res, next) => {
//   console.log('Hello from the middleware 👋');
//   next();
// });


// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });


// 3) ROUTES
app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  const err = new AppError(`Where do you get this url : ${req.originalUrl} from ?!!!!!`, 404);
  next(err);
});

app.use(globalErrorHandler);
module.exports = app;
