require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const cookieParser = require('cookie-parser');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const expressLayouts = require('express-ejs-layouts');

const connectDB = require('./config/database');
const appConfig = require('./config/app');
const constants = require('./config/constants');
const Setting = require('./models/Setting');
const { csrfInit, csrfVerify } = require('./middlewares/csrf');

// Initialize Express app
const app = express();

// Connect to Database
connectDB();

// Setup Morgan Logger
app.use(morgan('dev'));

// Static files directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse URL-encoded bodies and JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Compression for optimal page speeds
app.use(compression());

// Security Headers (Helmet) with relaxed CSP for CDN integrations
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// Express Session configuration with MongoStore
app.use(
  session({
    secret: appConfig.sessionSecret || 'toyberry-super-secret-key-2026',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    },
    store: MongoStore.create({
      mongoUrl: constants.MONGODB_URI,
      collectionName: 'sessions',
      ttl: 7 * 24 * 60 * 60 // 7 days
    })
  })
);

// Custom CSRF middlewares
app.use(csrfInit);
app.use(csrfVerify);

// EJS Layouts and View Engine
app.use(expressLayouts);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main-layout');

// Global Locals Injection Middleware
app.use(async (req, res, next) => {
  // Inject session details
  res.locals.user = req.session.user || null;
  
  // Inject session toast
  if (req.session.toast) {
    res.locals.sessionToast = req.session.toast;
    delete req.session.toast;
  } else if (req.query.toastType && req.query.toastMessage) {
    res.locals.sessionToast = {
      type: req.query.toastType,
      message: req.query.toastMessage
    };
  } else {
    res.locals.sessionToast = null;
  }

  // Calculate cart counts
  try {
    const Cart = mongoose.model('Cart');
    let cart = null;
    if (req.session.user) {
      cart = await Cart.findOne({ user: req.session.user._id });
    } else {
      cart = await Cart.findOne({ sessionId: req.sessionID });
    }

    if (cart && cart.items) {
      res.locals.cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    } else {
      res.locals.cartCount = 0;
    }
  } catch (err) {
    res.locals.cartCount = 0;
  }

  next();
});

// Maintenance Mode Middleware
app.use(async (req, res, next) => {
  const isLoginPage = req.path === '/login';
  const isLogoutPage = req.path === '/logout';
  const isAdminPath = req.path.startsWith('/admin');

  if (!isLoginPage && !isLogoutPage && !isAdminPath) {
    try {
      const maintenance = await Setting.findOne({ key: 'maintenance_mode' });
      if (maintenance && maintenance.value === 'true') {
        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
          return res.status(503).json({ success: false, message: 'Site is under maintenance.' });
        }
        return res.status(503).render('pages/maintenance', {
          title: 'Under Maintenance',
          layout: false
        });
      }
    } catch (err) {
      console.error('Error checking maintenance mode:', err);
    }
  }
  next();
});

// Routing Registry
const webRoutes = require('./routes/web');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);
app.use('/', webRoutes);

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).render('pages/404', {
    title: 'Page Not Found',
    breadcrumbs: []
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  try {
    const fs = require('fs');
    const path = require('path');
    fs.appendFileSync(path.join(__dirname, 'scratch', 'error.log'), `[${new Date().toISOString()}] ${req.method} ${req.url}\n${err.stack}\n\n`);
  } catch (logErr) {
    console.error('Failed to write to error.log:', logErr);
  }
  
  // Check if AJAX request
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error'
    });
  }

  res.status(err.status || 500).render('pages/404', {
    title: 'Server Error',
    breadcrumbs: [],
    message: 'An unexpected server error occurred.'
  });
});

// Run server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`ToyBerry Premium Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  console.log(`Open the site at: http://localhost:${PORT} or using your server's IP address`);
});

module.exports = app;
