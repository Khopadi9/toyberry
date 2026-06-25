const BaseController = require('../base/BaseController');
const Order = require('../../models/Order');

class AdminOrderController extends BaseController {
  async list(req, res) {
    try {
      const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
      return res.render('admin/orders/index', {
        title: 'Order Management',
        orders,
        layout: 'layouts/admin-layout'
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  }

  async detail(req, res) {
    try {
      const { id } = req.params;
      const order = await Order.findById(id).populate('user').populate('items.product');
      if (!order) {
        return res.status(404).send('Order not found');
      }

      return res.render('admin/orders/detail', {
        title: `Order #${order.orderNumber}`,
        order,
        layout: 'layouts/admin-layout'
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { orderStatus, paymentStatus, trackingNumber } = req.body;

      const updateData = {};
      if (orderStatus) updateData.orderStatus = orderStatus;
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;

      const order = await Order.findByIdAndUpdate(id, updateData, { new: true });
      if (!order) {
        return this.errorResponse(res, 'Order not found', 404);
      }

      return this.successResponse(res, { order }, 'Order updated successfully!');
    } catch (error) {
      return this.errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new AdminOrderController();
