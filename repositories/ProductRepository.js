const BaseRepository = require('./BaseRepository');
const Product = require('../models/Product');

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  async find(filter = {}, populate = '', select = '', sort = {}, limit = null, skip = null) {
    return await super.find(filter, populate, select, sort, limit, skip);
  }

  async findOne(filter = {}, populate = '', select = '') {
    return await super.findOne(filter, populate, select);
  }

  async count(filter = {}) {
    return await super.count(filter);
  }

  async searchProducts(queryText, categorySlug = null, minPrice = null, maxPrice = null, sort = {}, limit = 12, skip = 0) {
    const filter = { status: { $ne: 'Inactive' } };

    if (queryText) {
      const escapedQuery = queryText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      filter.$or = [
        { title: { $regex: escapedQuery, $options: 'i' } },
        { description: { $regex: escapedQuery, $options: 'i' } },
        { tags: { $regex: escapedQuery, $options: 'i' } }
      ];
    }

    if (categorySlug) {
      // Find category first, or match using category field populate. We can match by category ID.
      // But typically we can pass category ObjectId from service. Let's support either category ID or standard category match.
      filter.category = categorySlug;
    }

    if (minPrice !== null || maxPrice !== null) {
      filter.price = {};
      if (minPrice !== null) filter.price.$gte = minPrice;
      if (maxPrice !== null) filter.price.$lte = maxPrice;
    }

    return await this.find(filter, 'category brand', '', sort, limit, skip);
  }

  async getFeatured(limit = 8) {
    return await this.find({ status: { $ne: 'Inactive' }, isFeatured: true }, 'category brand', '', { createdAt: -1 }, limit);
  }

  async getNewArrivals(limit = 8) {
    return await this.find({ status: { $ne: 'Inactive' }, isNewArrival: true }, 'category brand', '', { createdAt: -1 }, limit);
  }

  async getTrending(limit = 8) {
    return await this.find({ status: { $ne: 'Inactive' }, isTrending: true }, 'category brand', '', { createdAt: -1 }, limit);
  }

  async getBestSellers(limit = 8) {
    return await this.find({ status: { $ne: 'Inactive' }, isBestSeller: true }, 'category brand', '', { createdAt: -1 }, limit);
  }

  async getRelated(categoryId, currentProductId, limit = 4) {
    return await this.find({
      status: { $ne: 'Inactive' },
      category: categoryId,
      _id: { $ne: currentProductId }
    }, 'category brand', '', { createdAt: -1 }, limit);
  }

  async getDealsOfTheWeek(limit = 10) {
    return await this.find({ status: { $ne: 'Inactive' }, isDealOfTheWeek: true }, 'category brand', '', { createdAt: -1 }, limit);
  }
}

module.exports = new ProductRepository();
