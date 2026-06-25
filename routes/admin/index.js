const express = require('express');
const router = express.Router();

const DashboardController = require('../../controllers/admin/DashboardController');
const AdminProductController = require('../../controllers/admin/AdminProductController');
const AdminOrderController = require('../../controllers/admin/AdminOrderController');
const AdminBannerController = require('../../controllers/admin/AdminBannerController');
const AdminCollectionController = require('../../controllers/admin/AdminCollectionController');

const { isAdmin } = require('../../middlewares/auth');
const { csrfVerify } = require('../../middlewares/csrf');
const upload = require('../../helpers/uploadHelper');

// Apply admin access control middleware to all admin routes
router.use(isAdmin);

// Multer error handling wrapper
const handleUpload = (multerMiddleware) => {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err) {
        let message = err.message;
        if (err.code === 'LIMIT_FILE_SIZE') {
          message = 'File too large. Maximum size allowed is 5MB.';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          message = 'Too many files uploaded. Maximum is 5.';
        }
        
        req.session.toast = { type: 'Error', message };
        const redirectUrl = req.header('Referer') || '/admin/products';
        return req.session.save(() => {
          res.redirect(redirectUrl);
        });
      }
      next();
    });
  };
};

// Admin Dashboard
router.get('/', DashboardController.index);
router.get('/dashboard', DashboardController.index);

// Admin Settings
router.get('/settings', DashboardController.settingsView);
router.post('/settings', csrfVerify, DashboardController.settingsSubmit);

// Maintenance Mode
router.get('/maintenance', DashboardController.maintenanceView);
router.post('/maintenance', csrfVerify, DashboardController.maintenanceSubmit);

// Product Management
router.get('/products', AdminProductController.list);
router.get('/products/add', AdminProductController.addView);
router.post('/products/add', handleUpload(upload.array('images', 5)), csrfVerify, AdminProductController.addSubmit);
router.get('/products/edit/:id', AdminProductController.editView);
router.post('/products/edit/:id', handleUpload(upload.array('images', 5)), csrfVerify, AdminProductController.editSubmit);
router.post('/products/delete/:id', csrfVerify, AdminProductController.delete);

// Carousel Management
router.get('/banners', AdminBannerController.list);
router.get('/banners/add', AdminBannerController.addView);
router.post('/banners/add', handleUpload(upload.single('image')), csrfVerify, AdminBannerController.addSubmit);
router.get('/banners/edit/:id', AdminBannerController.editView);
router.post('/banners/edit/:id', handleUpload(upload.single('image')), csrfVerify, AdminBannerController.editSubmit);
router.post('/banners/delete/:id', csrfVerify, AdminBannerController.delete);

// Collection Management
router.get('/collections', AdminCollectionController.list);
router.get('/collections/add', AdminCollectionController.addView);
router.post('/collections/add', handleUpload(upload.single('image')), csrfVerify, AdminCollectionController.addSubmit);
router.get('/collections/edit/:id', AdminCollectionController.editView);
router.post('/collections/edit/:id', handleUpload(upload.single('image')), csrfVerify, AdminCollectionController.editSubmit);
router.post('/collections/delete/:id', csrfVerify, AdminCollectionController.delete);

// Order Management
router.get('/orders', AdminOrderController.list);
router.get('/orders/detail/:id', AdminOrderController.detail);
router.post('/orders/update/:id', csrfVerify, AdminOrderController.updateStatus);

module.exports = router;
