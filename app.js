require('dotenv').config();
const fs = require('fs');
const express = require('express');
const app = express();

app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Hello from Natrous app',
    user: 'malaa',
  });
});

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
});

app.get('/api/v1/tours/:id', (req, res) => {
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
});

app.post('/api/v1/tours', (req, res) => {
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
});

app.post('/', (req, res) => {
  res.status(200).send('post method...');
});

app.patch('/api/v1/tours', (req, res) => {
  res.status(200).send('pathch...');
});

app.delete('/api/v1/tours/:id', (req, res) => {
  res.status(202).json({
    status: 'success',
    data: null,
  });
});

app.listen(process.env.PORT, process.env.HOST, () => {
  console.log('listenting...');
});
