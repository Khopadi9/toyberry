const OrderRepository = require('../repositories/OrderRepository');
const CartService = require('./CartService');
const Coupon = require('../models/Coupon');
const Product = require('../models/Product');

class OrderService {
  async checkout(userId, sessionId, shippingAddress, paymentMethod, couponCode = null) {
    const cart = await CartService.getOrCreateCart(userId, sessionId);
    if (!cart || cart.items.length === 0) {
      throw new Error('Your cart is empty');
    }

    // 1. Calculate subtotal and verify stock
    let subTotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product || product.status !== 'Active') {
        throw new Error(`Product ${item.product.title} is no longer available`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Not enough stock for ${product.title}. Only ${product.stock} left.`);
      }

      const price = product.salePrice || product.price;
      subTotal += price * item.quantity;

      orderItems.push({
        product: product._id,
        title: product.title,
        price: price,
        quantity: item.quantity
      });
    }

    // 2. Coupon calculation
    let discountAmount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      appliedCoupon = await Coupon.findOne({ code: couponCode, status: 'Active', expireDate: { $gt: new Date() } });
      if (appliedCoupon) {
        if (subTotal >= appliedCoupon.minPurchase) {
          if (appliedCoupon.discountType === 'Percentage') {
            discountAmount = subTotal * (appliedCoupon.value / 100);
          } else {
            discountAmount = appliedCoupon.value;
          }
          // Ensure discount doesn't exceed subTotal
          discountAmount = Math.min(discountAmount, subTotal);
        } else {
          throw new Error(`Minimum purchase amount for coupon ${couponCode} is ₹${appliedCoupon.minPurchase}`);
        }
      } else {
        throw new Error('Invalid or expired coupon code');
      }
    }

    // 3. Tax and Shipping calculations
    const taxRate = 0.08; // 8% Tax
    const tax = parseFloat(((subTotal - discountAmount) * taxRate).toFixed(2));
    const shippingFee = (subTotal - discountAmount) > 5000 ? 0 : 250; // Free shipping over ₹5000

    const grandTotal = parseFloat((subTotal - discountAmount + tax + shippingFee).toFixed(2));

    // 4. Generate order number
    const orderNumber = 'TB-' + Date.now().toString().slice(-8) + Math.floor(1000 + Math.random() * 9000);

    // 5. Create Order record
    const orderData = {
      orderNumber,
      user: userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'Online' ? 'Paid' : 'Pending',
      orderStatus: 'Pending',
      coupon: couponCode ? { code: couponCode, discountAmount } : undefined,
      subTotal,
      tax,
      shippingFee,
      grandTotal
    };

    const order = await OrderRepository.create(orderData);

    // 6. Update product stock and rating counts
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // 7. Clear user's cart
    await CartService.clearCart(userId, sessionId);

    return order;
  }

  async getOrderDetails(orderId, userId) {
    const order = await OrderRepository.findById(orderId);
    if (!order) return null;
    if (order.user.toString() !== userId.toString()) {
      throw new Error('Unauthorized access to this order');
    }
    return order;
  }

  async getUserOrders(userId, limit = 10, skip = 0) {
    return await OrderRepository.getByUser(userId, limit, skip);
  }

  async getOrdersCount(userId) {
    return await OrderRepository.getCountByUser(userId);
  }
}

module.exports = new OrderService();
