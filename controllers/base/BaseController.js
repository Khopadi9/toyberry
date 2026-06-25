const ResponseHelper = require('../../helpers/responseHelper');

class BaseController {
  constructor() {
    let proto = Object.getPrototypeOf(this);
    while (proto && proto !== Object.prototype) {
      for (const key of Object.getOwnPropertyNames(proto)) {
        if (key !== 'constructor' && typeof this[key] === 'function') {
          this[key] = this[key].bind(this);
        }
      }
      proto = Object.getPrototypeOf(proto);
    }
  }

  successResponse(res, data = {}, message = 'Success', statusCode = 200) {
    // If the data object already contains a message key, align with the user's example style
    const finalMessage = data.message || message;
    return ResponseHelper.success(res, data, finalMessage, statusCode);
  }

  errorResponse(res, message = 'An error occurred', statusCode = 500, errors = null) {
    return ResponseHelper.error(res, message, statusCode, errors);
  }

  validationResponse(res, errors = [], message = 'Validation errors occurred') {
    return ResponseHelper.validation(res, errors, message);
  }

  ajaxResponse(res, success = true, message = '', data = {}, statusCode = 200) {
    return res.status(statusCode).json({
      success,
      message,
      data
    });
  }

  redirectResponse(req, res, url, toastType = null, toastMessage = null) {
    if (toastType && toastMessage) {
      req.session.toast = { type: toastType, message: toastMessage };
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}toastType=${encodeURIComponent(toastType)}&toastMessage=${encodeURIComponent(toastMessage)}`;
    }
    return req.session.save((err) => {
      if (err) console.error('Session save error:', err);
      res.redirect(url);
    });
  }
}

module.exports = BaseController;
