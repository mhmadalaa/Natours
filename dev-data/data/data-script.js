require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('./../../models/tourModel');

// CONNEC TO REMOTE DATABASE
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

// READ LOCAL SAMPLE JSON FILE
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'),
);

// IMPORT DATA INTO DATABASE
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data loaded sucessfully.');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM REMOTE DATABASE
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted.');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// pass argument variable to decide what decision to do
// [--delete] to delete all data
// [--import] to load local data
// the command will be like that [node <file-path> --<option>],
// example to delete: [node dev-data/data/data-script.js --delete]

if (process.argv[2] === '--delete') {
  deleteData();
} else if (process.argv[2] === '--import') {
  importData();
} else {
  console.log('you need to specifiy an option');
  process.exit();
}
