/**
 * config/app.js
 * Application-level config derived from environment.
 * dotenv must be loaded before this module (done in app.js entry point).
 */

'use strict';

const constants = require('./constants');

module.exports = {
  name:        constants.APP_NAME,
  env:         process.env.NODE_ENV || 'development',
  port:        parseInt(process.env.PORT, 10) || 3000,
  url:         process.env.BASE_URL,
  sessionSecret: process.env.SESSION_SECRET,
  uploadPath:  constants.UPLOAD_DIR,
  isProduction: () => process.env.NODE_ENV === 'production'
};
