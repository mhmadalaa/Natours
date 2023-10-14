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
  let message = err.message;

  if (err.name === 'CastError') {
    message = handleCastErrorDB(err);
  } else if (err.name === 'MongoServerError' || err.code === 11000) {
    message = handleDuplicateErrorDB(err);
  } else if (err.name === 'ValidationError') {
    message = handleValidationError(err);
  }

  return new AppError(message, 400);
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
    const error = handleErrorDB(err);
    sendErrorProd(error, res);
  }
};
