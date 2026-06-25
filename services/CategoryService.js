const Category = require('../models/Category');

class CategoryService {
  async getAllActive() {
    return await Category.find({ status: 'Active' });
  }

  async getCategoryBySlug(slug) {
    return await Category.findOne({ slug, status: 'Active' });
  }
}

module.exports = new CategoryService();
