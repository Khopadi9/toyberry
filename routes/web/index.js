const express = require('express');
const router = express.Router();

const HomeController = require('../../controllers/customer/HomeController');
const ProductController = require('../../controllers/customer/ProductController');
const CartController = require('../../controllers/customer/CartController');
const OrderController = require('../../controllers/customer/OrderController');
const UserController = require('../../controllers/customer/UserController');
const BlogController = require('../../controllers/customer/BlogController');

const { isAuthenticated } = require('../../middlewares/auth');
const { csrfVerify } = require('../../middlewares/csrf');

// General pages
router.get('/', HomeController.index);
router.get('/about', HomeController.aboutView);
router.get('/contact', HomeController.contactView);
router.post('/contact', csrfVerify, HomeController.contactSubmit);
router.post('/newsletter/subscribe', csrfVerify, HomeController.newsletterSubscribe);
router.get('/shipping-policy', HomeController.shippingPolicyView);
router.get('/return-policy', HomeController.returnPolicyView);
router.get('/terms-conditions', HomeController.termsConditionsView);
router.get('/privacy-policy', HomeController.privacyPolicyView);

// Product Catalog
router.get('/toys', ProductController.list);
router.get('/toys/:slug', ProductController.detail);
router.get('/live-suggestions', ProductController.liveSuggestions);
router.get('/toys/quickview/:id', ProductController.quickView);
router.post('/submit-review', csrfVerify, ProductController.submitReview);

// Shopping Cart
router.get('/cart', CartController.index);
router.post('/cart/add', csrfVerify, CartController.add);
router.post('/cart/update', csrfVerify, CartController.update);
router.post('/cart/remove', csrfVerify, CartController.remove);
router.post('/cart/apply-coupon', csrfVerify, CartController.applyCoupon);

// Checkout & Orders
router.get('/checkout', OrderController.checkoutView);
router.post('/checkout/submit', csrfVerify, OrderController.checkoutSubmit);
router.get('/checkout/success', OrderController.successView);
router.get('/order/track', OrderController.trackView);
router.get('/order/detail/:orderNumber', isAuthenticated, OrderController.detail);
router.get('/order/invoice/:orderId', isAuthenticated, OrderController.downloadInvoice);

// Authentication
router.get('/register', UserController.registerView);
router.post('/register', csrfVerify, UserController.registerSubmit);
router.get('/login', UserController.loginView);
router.post('/login', csrfVerify, UserController.loginSubmit);
router.get('/logout', UserController.logout);

// OTP Verification
router.get('/verify-otp', UserController.otpView);
router.post('/verify-otp', csrfVerify, UserController.otpSubmit);
router.get('/forgot-password', UserController.forgotPasswordView);
router.post('/forgot-password', csrfVerify, UserController.forgotPasswordSubmit);
router.post('/reset-password', csrfVerify, UserController.resetPasswordSubmit);

// Customer Profile & Address Book
router.get('/profile', isAuthenticated, UserController.profile);
router.post('/profile/address', isAuthenticated, csrfVerify, UserController.saveAddress);
router.post('/profile/address/delete', isAuthenticated, csrfVerify, UserController.deleteAddress);

// Wishlist
router.get('/wishlist', UserController.wishlistView);
router.post('/wishlist/toggle', csrfVerify, UserController.toggleWishlist);

// Blog
router.get('/blog', BlogController.list);
router.get('/blog/:slug', BlogController.detail);

module.exports = router;
