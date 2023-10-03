require('dotenv').config();
const mongoose = require('mongoose');
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
    // console.log(con.connections);
    console.log('DB connecting successful...');
  });

app.listen(process.env.PORT || 8000, process.env.HOST, () => {
  console.log('listenting...');
});
