const constants = require('./constants');

module.exports = {
  name: constants.APP_NAME,
  env: constants.NODE_ENV,
  port: constants.PORT,
  url: constants.BASE_URL,
  uploadPath: constants.UPLOAD_DIR
};
