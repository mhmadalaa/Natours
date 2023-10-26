const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  return `Invalid ${err.path}: ${err.value}`;
};

const handleDuplicateErrorDB = (err) => {
  const field = err.errmsg.match(/[^{}]+(?=})/g)[0].replaceAll('"', '');

  return `Duplicate field ${field}, Please use another value!`;
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  return `Invalid input data. ${errors.join('. ')}`;
};

const handleErrorDB = (err) => {
  let message = 0;

  if (err.name === 'CastError') {
    message = handleCastErrorDB(err);
  } else if (err.name === 'MongoServerError' || err.code === 11000) {
    message = handleDuplicateErrorDB(err);
  } else if (err.name === 'ValidationError') {
    message = handleValidationError(err);
  }

  if (message !== 0) {
    return new AppError(message, 400);
  }

  return 0;
};

const handleErrorAuth = (err) => {
  let message = 0;

  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token, Please login again';
  } else if (err.name === 'TokenExpiredError') {
    message = 'Your token Expired, Please login again';
  }

  if (message !== 0) {
    return new AppError(message, 401);
  }

  return 0;
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    stack: err.stack,
    message: err.message,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else if (!err.isOperational) {
    res.status(500).json({
      status: 'error',
      message: 'something wrong happen! we will get soon.',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = handleErrorAuth(err);
    if (!error) error = handleErrorDB(err);

    sendErrorProd(error, res);
  }
};
