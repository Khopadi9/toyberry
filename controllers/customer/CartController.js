const BaseController = require('../base/BaseController');
const CartService = require('../../services/CartService');
const Coupon = require('../../models/Coupon');

class CartController extends BaseController {
  async index(req, res) {
    try {
      const userId = req.session.user ? req.session.user._id : null;
      const sessionId = req.sessionID;

      const cart = await CartService.getOrCreateCart(userId, sessionId);

      return res.render('pages/cart', {
        title: 'Shopping Cart',
        cart,
        seo: { title: 'Shopping Cart | ToyBerry' }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  }

  async add(req, res) {
    try {
      const { productId, quantity } = req.body;
      const userId = req.session.user ? req.session.user._id : null;
      const sessionId = req.sessionID;

      if (!productId) {
        return this.errorResponse(res, 'Product ID is required', 400);
      }

      const parsedQty = parseInt(quantity) || 1;
      const cart = await CartService.addToCart(userId, sessionId, productId, parsedQty);

      return this.successResponse(res, {
        message: 'Product added to cart successfully!',
        cart
      });
    } catch (error) {
      return this.errorResponse(res, error.message, 400);
    }
  }

  async update(req, res) {
    try {
      const { productId, quantity } = req.body;
      const userId = req.session.user ? req.session.user._id : null;
      const sessionId = req.sessionID;

      if (!productId || quantity === undefined) {
        return this.errorResponse(res, 'Product ID and quantity are required', 400);
      }

      const parsedQty = parseInt(quantity);
      if (parsedQty < 1) {
        return this.errorResponse(res, 'Quantity must be at least 1', 400);
      }

      const cart = await CartService.updateQuantity(userId, sessionId, productId, parsedQty);

      return this.successResponse(res, {
        message: 'Cart updated successfully',
        cart
      });
    } catch (error) {
      return this.errorResponse(res, error.message, 400);
    }
  }

  async remove(req, res) {
    try {
      const { productId } = req.body;
      const userId = req.session.user ? req.session.user._id : null;
      const sessionId = req.sessionID;

      if (!productId) {
        return this.errorResponse(res, 'Product ID is required', 400);
      }

      const cart = await CartService.removeItem(userId, sessionId, productId);

      return this.successResponse(res, {
        message: 'Item removed from cart',
        cart
      });
    } catch (error) {
      return this.errorResponse(res, error.message, 400);
    }
  }

  async applyCoupon(req, res) {
    try {
      const { code } = req.body;
      if (!code) {
        return this.errorResponse(res, 'Coupon code is required', 400);
      }

      const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        status: 'Active',
        expireDate: { $gt: new Date() }
      });

      if (!coupon) {
        return this.errorResponse(res, 'Invalid or expired coupon code', 400);
      }

      return this.successResponse(res, {
        message: 'Coupon code validated successfully!',
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          value: coupon.value,
          minPurchase: coupon.minPurchase
        }
      });
    } catch (error) {
      return this.errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new CartController();
