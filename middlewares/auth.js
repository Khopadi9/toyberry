const constants = require('../config/constants');

const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }

  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.'
    });
  }

  req.session.toast = { type: 'Warning', message: 'Please log in to access this page.' };
  return res.redirect('/');
};

const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === constants.ROLES.ADMIN) {
    return next();
  }

  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.'
    });
  }

  req.session.toast = { type: 'Error', message: 'Access denied. Administrator privileges required.' };
  return res.redirect('/');
};

module.exports = {
  isAuthenticated,
  isAdmin
};
