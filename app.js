const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');

const app = express();

// MIDDELWARES
app.use(morgan('dev'));
app.use(express.json());

// app.use((req, res, next) => {
//   console.log('hello from middelware...');
//   next();
// });

// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

// CONTROLLERS

// ROUTERS
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app; 