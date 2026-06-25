module.exports = {
  APP_NAME: 'ToyBerry',
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/toyberry',
  SESSION_SECRET: process.env.SESSION_SECRET || 'toyberry_super_secret_key_12345',
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
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
