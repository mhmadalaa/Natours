require('dotenv').config();
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Hello from Natrous app',
    user: 'malaa',
  });
});

app.post('/', (req, res) => {
  res.status(200).send('post method...');
});

app.listen(process.env.PORT, process.env.HOST, () => {
  console.log('listenting...');
});
