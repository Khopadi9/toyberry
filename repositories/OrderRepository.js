const BaseRepository = require('./BaseRepository');
const Order = require('../models/Order');

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  async getByUser(userId, limit = 10, skip = 0) {
    return await this.find(
      { user: userId },
      'items.product',
      '',
      { createdAt: -1 },
      limit,
      skip
    );
  }

  async getCountByUser(userId) {
    return await this.count({ user: userId });
  }

  async findByOrderNumber(orderNumber) {
    return await this.findOne({ orderNumber }, 'user items.product');
  }
}

module.exports = new OrderRepository();
