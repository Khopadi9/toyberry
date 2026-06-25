const BaseController = require('../base/BaseController');
const UserService = require('../../services/UserService');
const Wishlist = require('../../models/Wishlist');
const Product = require('../../models/Product');
const Order = require('../../models/Order');

class UserController extends BaseController {
  async registerView(req, res) {
    if (req.session.user) {
      if (req.session.user.role === 'admin') return res.redirect('/admin/dashboard');
      return res.redirect('/profile');
    }
    return res.redirect('/login');
  }

  async registerSubmit(req, res) {
    return this.errorResponse(res, 'Registration is disabled.', 403);
  }

  async loginView(req, res) {
    if (req.session.user) {
      if (req.session.user.role === 'admin') return res.redirect('/admin/dashboard');
      return res.redirect('/profile');
    }
    return res.render('pages/login', { title: 'Login', seo: { title: 'Login | ToyBerry' } });
  }

  async loginSubmit(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return this.errorResponse(res, 'Email and Password are required', 400);
      }

      const user = await UserService.login(email, password);

      // Verify email OTP flow if not verified
      if (!user.isVerified) {
        // Send a new OTP
        await UserService.sendForgotPasswordOTP(email);
        return this.ajaxResponse(res, false, 'Account not verified. OTP sent to your email.', { email, unverified: true });
      }

      // Merge guest cart with user cart
      const CartService = require('../../services/CartService');
      await CartService.mergeCart(req.sessionID, user._id);

      req.session.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses
      };

      return this.successResponse(res, { user: req.session.user }, 'Login successful!');
    } catch (error) {
      return this.errorResponse(res, error.message, 400);
    }
  }

  async logout(req, res) {
    req.session.destroy(err => {
      if (err) console.error(err);
      res.redirect('/');
    });
  }

  async otpView(req, res) {
    const { email, type } = req.query;
    return res.render('pages/verify-otp', {
      title: 'Verify OTP',
      email,
      type: type || 'verification',
      seo: { title: 'Verify OTP | ToyBerry' }
    });
  }

  async otpSubmit(req, res) {
    try {
      const { email, code, type } = req.body;
      if (!email || !code) {
        return this.errorResponse(res, 'Email and OTP code are required', 400);
      }

      const user = await UserService.verifyOTP(email, code);
      req.session.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses
      };

      return this.successResponse(res, { user: req.session.user }, 'Account verified successfully!');
    } catch (error) {
      return this.errorResponse(res, error.message, 400);
    }
  }

  async forgotPasswordView(req, res) {
    return res.render('pages/forgot-password', {
      title: 'Forgot Password',
      seo: { title: 'Forgot Password | ToyBerry' }
    });
  }

  async forgotPasswordSubmit(req, res) {
    try {
      const { email } = req.body;
      if (!email) return this.errorResponse(res, 'Email is required', 400);

      await UserService.sendForgotPasswordOTP(email);
      return this.successResponse(res, { email }, 'OTP code has been sent to your email.');
    } catch (error) {
      return this.errorResponse(res, error.message, 400);
    }
  }

  async resetPasswordSubmit(req, res) {
    try {
      const { email, code, newPassword } = req.body;
      if (!email || !code || !newPassword) {
        return this.errorResponse(res, 'All fields are required', 400);
      }

      await UserService.resetPassword(email, code, newPassword);
      return this.successResponse(res, {}, 'Password reset successful! Please login with your new password.');
    } catch (error) {
      return this.errorResponse(res, error.message, 400);
    }
  }

  async profile(req, res) {
    try {
      const userId = req.session.user ? req.session.user._id : null;
      if (!userId) return res.redirect('/login');

      // Fetch user orders and recently viewed products
      const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

      let recentlyViewed = [];
      if (req.session.recentlyViewed && req.session.recentlyViewed.length > 0) {
        recentlyViewed = await Product.find({ _id: { $in: req.session.recentlyViewed } });
      }

      return res.render('pages/profile', {
        title: 'My Profile',
        user: req.session.user,
        orders,
        recentlyViewed,
        seo: { title: 'My Profile | ToyBerry' }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  }

  async saveAddress(req, res) {
    try {
      const userId = req.session.user ? req.session.user._id : null;
      if (!userId) return this.errorResponse(res, 'Unauthorized', 401);

      const { label, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;
      const addresses = await UserService.addAddress(userId, {
        label,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        isDefault: isDefault === 'true' || isDefault === true
      });

      // Update session data
      req.session.user.addresses = addresses;
      return this.successResponse(res, { addresses }, 'Address saved successfully.');
    } catch (error) {
      return this.errorResponse(res, error.message, 400);
    }
  }

  async deleteAddress(req, res) {
    try {
      const userId = req.session.user ? req.session.user._id : null;
      if (!userId) return this.errorResponse(res, 'Unauthorized', 401);

      const { addressId } = req.body;
      const addresses = await UserService.removeAddress(userId, addressId);

      // Update session data
      req.session.user.addresses = addresses;
      return this.successResponse(res, { addresses }, 'Address removed successfully.');
    } catch (error) {
      return this.errorResponse(res, error.message, 400);
    }
  }

  async wishlistView(req, res) {
    try {
      const wishlistProductIds = req.session.wishlist || [];
      const Product = require('../../models/Product');
      const products = await Product.find({ _id: { $in: wishlistProductIds } }).populate('category brand');

      if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
        return res.json({ success: true, data: { products } });
      }

      return res.render('pages/wishlist', {
        title: 'My Wishlist',
        products,
        seo: { title: 'My Wishlist | ToyBerry' }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  }

  async toggleWishlist(req, res) {
    try {
      const { productId } = req.body;
      if (!productId) return this.errorResponse(res, 'Product ID is required', 400);

      if (!req.session.wishlist) {
        req.session.wishlist = [];
      }

      const index = req.session.wishlist.indexOf(productId);
      let isAdded = false;

      if (index > -1) {
        req.session.wishlist.splice(index, 1);
      } else {
        req.session.wishlist.push(productId);
        isAdded = true;
      }

      return this.successResponse(res, { isAdded }, isAdded ? 'Added to wishlist' : 'Removed from wishlist');
    } catch (error) {
      return this.errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new UserController();
