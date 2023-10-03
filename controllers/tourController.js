const Tour = require('./../models/tourModel');

/*
  replace all xxxx for the valide Data from database, 
  it's because file system db we use before we deprecated.
*/

// MIDDELWARES

exports.checkID = (req, res, next, val) => {
  // console.log(`The id is: ${val}`);

  // return res.status(404).json({
  //   status: 'fail',
  //   message: 'tour not founded',
  // });

  next();
};

exports.checkBody = (req, res, next) => {
  // return res.status(500).json({
  //   status: 'fail',
  //   message: 'not a valid tour to be added',
  // });

  next();
};

// CONTROLLERS

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: xxxx,
    time: req.requestTime,
    data: {
      tours: xxxx,
    },
  });
};

exports.getTourById = (req, res) => {
  res.status(200).json({
    status: 'success',
    tour: xxxx,
  });
};

exports.postNewTour = (req, res) => {
  res.status(201).json({
    status: 'success',
    data: {
      tour: xxxx,
    },
  });
};

exports.testPost = (req, res) => {
  res.status(200).send('post method...');
};

exports.testPatch = (req, res) => {
  res.status(200).send('pathch...');
};

exports.testDelete = (req, res) => {
  res.status(202).json({
    status: 'success',
    data: null,
  });
};
