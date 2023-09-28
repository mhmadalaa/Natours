require('dotenv').config();
const fs = require('fs');
const express = require('express');
const app = express();

app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const getHome = (req, res) => {
  res.status(200).json({
    message: 'Hello from Natrous app',
    user: 'malaa',
  });
};

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
};

const getTourById = (req, res) => {
  const tour = tours.find((el) => el.id === parseInt(req.params.id));

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

const postNewTour = (req, res) => {
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

const testPost = (req, res) => {
  res.status(200).send('post method...');
};

const testPatch = (req, res) => {
  res.status(200).send('pathch...');
};

const testDelete = (req, res) => {
  res.status(202).json({
    status: 'success',
    data: null,
  });
};

// app.get('/', getHome);
// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTourById);
// app.post('/api/v1/tours', postNewTour);
// app.post('/', testPost);
// app.patch('/api/v1/tours', testPatch);
// app.delete('/api/v1/tours/:id', testDelete);

app.route('/').get(getHome).post(testPost);
app.route('/api/v1/tours').get(getAllTours).post(postNewTour).patch(testPatch);
app.route('/api/v1/tours/:id').get(getTourById).delete(testDelete);

app.listen(process.env.PORT, process.env.HOST, () => {
  console.log('listenting...');
});
