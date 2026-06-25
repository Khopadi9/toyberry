const ProductRepository = require('../repositories/ProductRepository');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Review = require('../models/Review');

class ProductService {
  async getHomeProducts() {
    let [featured, newArrivals, trending, bestSellers, dealsOfTheWeek] = await Promise.all([
      ProductRepository.getFeatured(8),
      ProductRepository.getNewArrivals(8),
      ProductRepository.getTrending(8),
      ProductRepository.getBestSellers(8),
      ProductRepository.getDealsOfTheWeek(10)
    ]);

    // Fallback if no toys are flagged as featured/new/trending
    if (featured.length === 0 && newArrivals.length === 0 && trending.length === 0) {
      const fallbackProducts = await ProductRepository.find({ status: { $ne: 'Inactive' } }, 'category brand', '', { createdAt: -1 }, 8);
      featured = fallbackProducts;
      newArrivals = fallbackProducts;
      trending = fallbackProducts;
    }

    if (dealsOfTheWeek.length === 0) {
      dealsOfTheWeek = await ProductRepository.find({ status: { $ne: 'Inactive' } }, 'category brand', '', { createdAt: -1 }, 10);
    }

    return { featured, newArrivals, trending, bestSellers, dealsOfTheWeek };
  }

  async getProductDetails(slug) {
    const product = await ProductRepository.findOne({ slug }, 'category brand');
    if (!product) return null;

    const related = await ProductRepository.getRelated(product.category._id, product._id, 4);
    const reviews = await Review.find({ product: product._id, status: 'Approved' }).populate('user', 'name');

    return { product, related, reviews };
  }

  async getFilteredProducts({ category, brand, minPrice, maxPrice, search, sort, limit, skip }) {
    const filter = { status: { $ne: 'Inactive' } };

    if (category) {
      const catObj = await Category.findOne({ slug: category });
      if (catObj) filter.category = catObj._id;
    }

    if (brand) {
      const brandObj = await Brand.findOne({ slug: brand });
      if (brandObj) filter.brand = brandObj._id;
    }

    if (search) {
      const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const matchingBrands = await Brand.find({ name: { $regex: escapedSearch, $options: 'i' } });
      const brandIds = matchingBrands.map(b => b._id);

      const matchingCategories = await Category.find({ name: { $regex: escapedSearch, $options: 'i' } });
      const catIds = matchingCategories.map(c => c._id);

      filter.$or = [
        { title: { $regex: escapedSearch, $options: 'i' } },
        { description: { $regex: escapedSearch, $options: 'i' } },
        { tags: { $regex: escapedSearch, $options: 'i' } },
        { brand: { $in: brandIds } },
        { category: { $in: catIds } }
      ];
    }

    if ((minPrice !== undefined && minPrice !== '') || (maxPrice !== undefined && maxPrice !== '')) {
      filter.price = {};
      if (minPrice !== undefined && minPrice !== '') filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') filter.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };

    const [products, total] = await Promise.all([
      ProductRepository.find(filter, 'category brand', '', sortOption, limit, skip),
      ProductRepository.count(filter)
    ]);

    return { products, total };
  }

  async addReview(productId, userId, rating, comment) {
    const review = await Review.create({
      product: productId,
      user: userId,
      rating: Number(rating),
      comment,
      status: 'Approved' // auto-approve for demonstration, or default to Pending
    });

    // Update Product average rating
    const reviews = await Review.find({ product: productId, status: 'Approved' });
    const count = reviews.length;
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / count;

    const Product = require('../models/Product');
    await Product.findByIdAndUpdate(productId, {
      rating: parseFloat(avg.toFixed(1)),
      ratingCount: count
    });

    return review;
  }
}

module.exports = new ProductService();
