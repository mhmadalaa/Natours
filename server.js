require('dotenv').config();

const app = require('./app') 

// START SERVER
app.listen(process.env.PORT, process.env.HOST, () => {
  console.log('listenting...');
});
