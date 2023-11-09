const xss = require('xss');

module.exports = (req, res, next) => {
  // Apply xss to all request parameters
  for (const key in req.params) {
    req.params[key] = xss(req.params[key]);
  }
  // for (const key in req.query) {
  //   req.query[key] = xss(req.query[key]);
  // }
  for (const key in req.body) {
    req.body[key] = xss(req.body[key]);
  }

  next();
};