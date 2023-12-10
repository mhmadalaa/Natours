const path = require('path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');
const sanitizeInput = require('./utils/sanitizeInput');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');
const reviewRouter = require('./routes/reviewRoute');

const app = express();

// View templates
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from `public` dir without routing
app.use(express.static(path.join(__dirname, './public')));

// Set security http headers
app.use(helmet());

// Logging the requests in development environment
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later!',
});
app.use('/api', limiter);

// Barser to accept json data format with the request body with max 10kb data
app.use(
  express.json({
    limit: '10kb',
  }),
);

// Sanitize data against NoSQL query injection
app.use(mongoSanitize());

// Sanitize data againt XSS (Cross Site Scripting) attack
app.use(sanitizeInput);

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// API ROUTERS
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// HANDEL UNHANDELED ROUTERS
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.url} on this server!`, 404));
});

// ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;
