const fs = require('fs');

// DATA
const tours = JSON.parse(
  fs.readFileSync('./dev-data/data/tours-simple.json')
);

// MIDDELWARES

exports.checkID = (req, res, next, val) => {
  console.log(`The id is: ${val}`);

  const tour = tours.find(
    (el) => el.id === parseInt(req.params.id)
  );

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'tour not founded',
    });
  }

  next();
};

exports.checkBody = (req, res, next) => {
  if (req.body.name && req.body.duration) {
    next();
    return;
  }

  return res.status(500).json({
    status: 'fail',
    message: 'not a valid tour to be added',
  });
};

// CONTROLLERS

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    time: req.requestTime,
    data: {
      tours: tours,
    },
  });
};

exports.getTourById = (req, res) => {
  const tour = tours.find(
    (el) => el.id === parseInt(req.params.id)
  );

  res.status(200).json({
    status: 'success',
    tour: tour,
  });
};

exports.postNewTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
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
