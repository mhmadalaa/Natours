const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');

const app = express();

// MIDDELWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static('./public')); // to server static file not from the route

// app.use((req, res, next) => {.
//   req.requestTime = new Date().toISOString();
//   next();
// });

// ROUTERS
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// HANDEL UNHANDELED ROUTERS
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.url} Not Found!`,
  // });

  // const err = new Error(`Can't find ${req.url} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.url} on this server!`, 404));
});

// ERROR HANDLING MIDDLEWARE
// when specifing 4 parameters to express use function
// it will recognize that is an error middleware
app.use(globalErrorHandler);

module.exports = app;
