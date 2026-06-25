const BaseController = require('../base/BaseController');
const Product = require('../../models/Product');
const Order = require('../../models/Order');
const User = require('../../models/User');
const Contact = require('../../models/Contact');
const Setting = require('../../models/Setting');

class DashboardController extends BaseController {
  async index(req, res) {
    try {
      const [totalProducts, totalOrders, totalUsers, totalContacts, recentOrders, recentContacts, recentProducts] = await Promise.all([
        Product.countDocuments(),
        Order.countDocuments(),
        User.countDocuments({ role: 'customer' }),
        Contact.countDocuments({ status: 'Pending' }),
        Order.find().populate('user', 'name').sort({ createdAt: -1 }).limit(5),
        Contact.find().sort({ createdAt: -1 }).limit(5),
        Product.find().populate('category').sort({ createdAt: -1 }).limit(5)
      ]);

      // Calculate total earnings
      const paidOrders = await Order.find({ paymentStatus: 'Paid' });
      const totalEarnings = paidOrders.reduce((sum, order) => sum + order.grandTotal, 0);

      return res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        metrics: {
          totalProducts,
          totalOrders,
          totalUsers,
          totalEarnings: parseFloat(totalEarnings.toFixed(2)),
          totalContacts
        },
        recentOrders,
        recentContacts,
        recentProducts,
        layout: 'layouts/admin-layout'
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  }

  async settingsView(req, res) {
    try {
      return res.render('admin/settings', {
        title: 'Settings',
        layout: 'layouts/admin-layout'
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  }

  async settingsSubmit(req, res) {
    try {
      const { name, email, password } = req.body;
      const user = await User.findById(req.session.user._id);
      if (!user) {
        return this.redirectResponse(req, res, '/admin/settings', 'Error', 'User not found');
      }

      user.name = name;
      user.email = email;
      if (password && password.trim().length > 0) {
        user.password = password;
      }

      await user.save();

      // Update session details
      req.session.user.name = user.name;
      req.session.user.email = user.email;

      return this.redirectResponse(req, res, '/admin/settings', 'Success', 'Settings updated successfully!');
    } catch (error) {
      console.error(error);
      return this.redirectResponse(req, res, '/admin/settings', 'Error', error.message);
    }
  }

  async maintenanceView(req, res) {
    try {
      let maintenance = await Setting.findOne({ key: 'maintenance_mode' });
      if (!maintenance) {
        maintenance = await Setting.create({ key: 'maintenance_mode', value: 'false' });
      }

      return res.render('admin/maintenance', {
        title: 'Maintenance Mode',
        maintenanceEnabled: maintenance.value === 'true',
        layout: 'layouts/admin-layout'
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  }

  async maintenanceSubmit(req, res) {
    try {
      const { maintenance_mode } = req.body;
      
      let maintenance = await Setting.findOne({ key: 'maintenance_mode' });
      if (!maintenance) {
        await Setting.create({ key: 'maintenance_mode', value: maintenance_mode });
      } else {
        maintenance.value = maintenance_mode;
        await maintenance.save();
      }

      return this.redirectResponse(req, res, '/admin/maintenance', 'Success', 'Maintenance status updated successfully!');
    } catch (error) {
      console.error(error);
      return this.redirectResponse(req, res, '/admin/maintenance', 'Error', error.message);
    }
  }
}

module.exports = new DashboardController();
