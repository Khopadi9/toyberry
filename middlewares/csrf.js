const crypto = require('crypto');

const csrfInit = (req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(24).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
};

const csrfVerify = (req, res, next) => {
  next();
};

module.exports = {
  csrfInit,
  csrfVerify
};
