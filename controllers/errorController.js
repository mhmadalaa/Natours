const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    stack: err.stack,
    message: err.message,
  });
};

const sendErrorProd = (err, res) => {
  // we set isOperational in the trusted errors, aka the errors we flag
  // to handle, but if we have a programming errors or network failures
  // or something like that which not a case of operations, we will return
  // a generic error message to handle what the client serve and not to be
  // messey or to be more informational than what it should be
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // log the error
    console.error('ERROR...', err);

    // send generic resposne
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
    sendErrorProd(err, res);
  }
};
