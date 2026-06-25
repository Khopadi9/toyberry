/**
 * constants.js — Static application constants only.
 * No process.env reads here. For environment-specific config see config/env.js.
 */

'use strict';

module.exports = {
  APP_NAME: 'ToyBerry',

  UPLOAD_DIR: 'public/uploads',

  DEFAULT_PAGE_SIZE: 12,

  ROLES: {
    ADMIN: 'admin',
    CUSTOMER: 'customer'
  },

  ORDER_STATUS: {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled'
  },

  PAYMENT_METHODS: {
    COD: 'COD',
    ONLINE: 'Online'
  },

  PAYMENT_STATUS: {
    PENDING: 'Pending',
    PAID: 'Paid',
    FAILED: 'Failed'
  }
};
