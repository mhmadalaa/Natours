require('dotenv').config();
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log(err.name, ':', err.message);
  console.log('UNCAUGHT EXCEPTIOIN, Shutting down...');

  process.exit(1);
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then((con) => {
    console.log('DB connecting successful...');
  })
  .catch((err) => {
    console.log('DB connection ERROR!!');
  });

const server = app.listen(process.env.PORT || 3000, process.env.HOST, () => {
  console.log('listenting...');
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, ':', err.message);
  console.log('UNHANDLED REJECTION, Shutting down...');

  server.close(() => {
    process.exit(1);
  });
});
