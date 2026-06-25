const BaseController = require('../base/BaseController');
const OrderService = require('../../services/OrderService');
const CartService = require('../../services/CartService');

class OrderController extends BaseController {
  async checkoutView(req, res) {
    try {
      const userId = req.session.user ? req.session.user._id : null;
      const cart = await CartService.getOrCreateCart(userId, req.sessionID);
      if (!cart || cart.items.length === 0) {
        return this.redirectResponse(req, res, '/cart', 'Warning', 'Your cart is empty.');
      }

      const addresses = req.session.user ? (req.session.user.addresses || []) : [];

      return res.render('pages/checkout', {
        title: 'Checkout',
        cart,
        addresses,
        seo: { title: 'Checkout | ToyBerry' }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  }

  async checkoutSubmit(req, res) {
    try {
      let userId = req.session.user ? req.session.user._id : null;

      if (!userId) {
        const User = require('../../models/User');
        let defaultUser = await User.findOne({ email: 'customer@toyberry.com' });
        if (!defaultUser) {
          defaultUser = await User.findOne({ role: 'customer' });
        }
        if (defaultUser) {
          userId = defaultUser._id;
        }
      }

      if (!userId) {
        return this.errorResponse(res, 'System customer user not found for guest order mapping.', 500);
      }

      const { shippingAddress, paymentMethod, couponCode } = req.body;

      if (!shippingAddress || !shippingAddress.name || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode || !shippingAddress.phone) {
        return this.errorResponse(res, 'All shipping fields are required', 400);
      }

      const order = await OrderService.checkout(userId, req.sessionID, shippingAddress, paymentMethod, couponCode);

      return this.successResponse(res, {
        message: 'Order placed successfully!',
        order: {
          orderNumber: order.orderNumber,
          grandTotal: order.grandTotal
        }
      });
    } catch (error) {
      return this.errorResponse(res, error.message, 400);
    }
  }

  async successView(req, res) {
    const { orderNumber } = req.query;
    return res.render('pages/order-success', {
      title: 'Order Placed Successfully',
      orderNumber,
      seo: { title: 'Order Success | ToyBerry' }
    });
  }

  async trackView(req, res) {
    try {
      const { orderNumber } = req.query;
      let order = null;
      if (orderNumber) {
        const Order = require('../../models/Order');
        order = await Order.findOne({ orderNumber }).populate('items.product');
      }

      return res.render('pages/track-order', {
        title: 'Track Your Order',
        order,
        orderNumber,
        seo: { title: 'Track Order | ToyBerry' }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  }

  async detail(req, res) {
    try {
      const { orderNumber } = req.params;
      const userId = req.session.user ? req.session.user._id : null;
      if (!userId) {
        return this.redirectResponse(req, res, '/login', 'Warning', 'Please log in to view order details.');
      }

      const Order = require('../../models/Order');
      const order = await Order.findOne({ orderNumber, user: userId }).populate('items.product');
      if (!order) {
        return res.status(404).render('pages/404', { title: 'Order Not Found', seo: { title: 'Not Found | ToyBerry' } });
      }

      return res.render('pages/order-detail', {
        title: `Order #${order.orderNumber}`,
        order,
        seo: { title: `Order #${order.orderNumber} | ToyBerry` }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  }

  async downloadInvoice(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.session.user ? req.session.user._id : null;
      if (!userId) {
        return res.status(401).send('Unauthorized');
      }

      const Order = require('../../models/Order');
      const order = await Order.findById(orderId).populate('user');
      if (!order || order.user._id.toString() !== userId.toString()) {
        return res.status(404).send('Order not found');
      }

      // Simple premium HTML invoice download
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.html`);

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice #${order.orderNumber}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 40px; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); font-size: 16px; line-height: 24px; }
            .invoice-box table { width: 100%; line-height: inherit; text-align: left; }
            .invoice-box table td { padding: 5px; vertical-align: top; }
            .invoice-box table tr td:nth-child(2) { text-align: right; }
            .invoice-box table tr.top table td { padding-bottom: 20px; }
            .invoice-box table tr.top table td.title { font-size: 45px; line-height: 45px; color: #FF6B6B; font-weight: bold; }
            .invoice-box table tr.information table td { padding-bottom: 40px; }
            .invoice-box table tr.heading td { background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; }
            .invoice-box table tr.details td { padding-bottom: 20px; }
            .invoice-box table tr.item td { border-bottom: 1px solid #eee; }
            .invoice-box table tr.item.last td { border-bottom: none; }
            .invoice-box table tr.total td:nth-child(2) { border-top: 2px solid #eee; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <table cellpadding="0" cellspacing="0">
              <tr class="top">
                <td colspan="2">
                  <table>
                    <tr>
                      <td class="title">ToyBerry</td>
                      <td>
                        Invoice #: ${order.orderNumber}<br>
                        Created: ${new Date(order.createdAt).toLocaleDateString()}<br>
                        Payment Status: ${order.paymentStatus}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr class="information">
                <td colspan="2">
                  <table>
                    <tr>
                      <td>
                        <strong>Shipping Address:</strong><br>
                        ${order.shippingAddress.name}<br>
                        ${order.shippingAddress.addressLine1}<br>
                        ${order.shippingAddress.addressLine2 || ''}<br>
                        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
                        Phone: ${order.shippingAddress.phone}
                      </td>
                      <td>
                        <strong>Customer Details:</strong><br>
                        ${order.user.name}<br>
                        ${order.user.email}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr class="heading">
                <td>Item</td>
                <td>Price</td>
              </tr>
              ${order.items.map(item => `
                <tr class="item">
                  <td>${item.title} (x${item.quantity})</td>
                  <td>$${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="total">
                <td></td>
                <td>
                  Subtotal: $${order.subTotal.toFixed(2)}<br>
                  ${order.coupon ? `Discount (${order.coupon.code}): -$${order.coupon.discountAmount.toFixed(2)}<br>` : ''}
                  Tax (8%): $${order.tax.toFixed(2)}<br>
                  Shipping: $${order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee.toFixed(2)}`}<br>
                  <strong>Grand Total: $${order.grandTotal.toFixed(2)}</strong>
                </td>
              </tr>
            </table>
          </div>
        </body>
        </html>
      `;

      return res.send(html);
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  }
}

module.exports = new OrderController();
