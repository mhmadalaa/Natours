require('dotenv').config();

const app = require('./app') 

console.log(app.get('env')); 
console.log(process.env); 

// START SERVER
app.listen(process.env.PORT, process.env.HOST, () => {
  console.log('listenting...');
});
