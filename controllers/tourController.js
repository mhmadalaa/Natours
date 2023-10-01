const fs = require('fs');

// DATA
const tours = JSON.parse(
  fs.readFileSync('./dev-data/data/tours-simple.json')
);

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

  if (tour) {
    res.status(200).json({
      status: 'success',
      tour: tour,
    });
  } else {
    res.status(404).json({
      status: 'fail',
      message: 'tour not founded',
    });
  }
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
