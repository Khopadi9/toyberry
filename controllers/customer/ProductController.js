const BaseController = require('../base/BaseController');
const ProductService = require('../../services/ProductService');
const CategoryService = require('../../services/CategoryService');
const Brand = require('../../models/Brand');
const Product = require('../../models/Product');
const Category = require('../../models/Category');
const PaginationHelper = require('../../helpers/paginationHelper');

class ProductController extends BaseController {
  async list(req, res) {
    try {
      const { category, brand, minPrice, maxPrice, search, sort, page: qPage, limit: qLimit } = req.query;
      const { page, limit, skip } = PaginationHelper.getPaginationParams(qPage, qLimit, 12);

      const { products, total } = await ProductService.getFilteredProducts({
        category,
        brand,
        minPrice,
        maxPrice,
        search,
        sort,
        limit,
        skip
      });

      const [categories, brands] = await Promise.all([
        CategoryService.getAllActive(),
        Brand.find({ status: 'Active' })
      ]);

      const pagination = PaginationHelper.getPaginationMetadata(total, page, limit);

      // If AJAX request, return product grid HTML or JSON
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return this.successResponse(res, { products, pagination });
      }

      return res.render('pages/catalog', {
        title: 'Shop Premium Toys',
        products,
        categories,
        brands,
        pagination,
        filters: { category, brand, minPrice, maxPrice, search, sort },
        seo: {
          title: 'Shop Toys | ToyBerry',
          description: 'Browse through our premium selection of toys. Filter by category, price, and brand.'
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  }

  async detail(req, res) {
    try {
      const { slug } = req.params;
      const details = await ProductService.getProductDetails(slug);
      if (!details) {
        return res.status(404).render('pages/404', { title: 'Product Not Found', seo: { title: 'Not Found | ToyBerry' } });
      }

      const { product, related, reviews } = details;

      // Track recently viewed in session
      if (!req.session.recentlyViewed) {
        req.session.recentlyViewed = [];
      }
      if (!req.session.recentlyViewed.includes(product._id.toString())) {
        req.session.recentlyViewed.push(product._id.toString());
        if (req.session.recentlyViewed.length > 5) {
          req.session.recentlyViewed.shift();
        }
      }

      return res.render('pages/product-detail', {
        title: product.title,
        product,
        related,
        reviews,
        seo: {
          title: `${product.title} | ToyBerry`,
          description: product.shortDescription || product.description,
          keywords: product.tags ? product.tags.join(', ') : ''
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  }

  async liveSuggestions(req, res) {
    try {
      const { query } = req.query;
      if (!query || query.length < 2) {
        return this.successResponse(res, []);
      }

      const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const matchingBrands = await Brand.find({ name: { $regex: escapedQuery, $options: 'i' } });
      const brandIds = matchingBrands.map(b => b._id);

      const matchingCategories = await Category.find({ name: { $regex: escapedQuery, $options: 'i' } });
      const catIds = matchingCategories.map(c => c._id);

      const suggestions = await Product.find({
        status: 'Active',
        $or: [
          { title: { $regex: escapedQuery, $options: 'i' } },
          { description: { $regex: escapedQuery, $options: 'i' } },
          { tags: { $regex: escapedQuery, $options: 'i' } },
          { brand: { $in: brandIds } },
          { category: { $in: catIds } }
        ]
      })
      .limit(5)
      .select('title slug price images');

      return this.successResponse(res, suggestions);
    } catch (error) {
      return this.errorResponse(res, error.message);
    }
  }

  async submitReview(req, res) {
    try {
      const { rating, comment, productId, guestName } = req.body;

      if (!rating || !comment || !productId || !guestName) {
        return this.errorResponse(res, 'All fields are required.', 400);
      }

      const User = require('../../models/User');
      let defaultUser = await User.findOne({ email: 'customer@toyberry.com' });
      if (!defaultUser) {
        defaultUser = await User.findOne({ role: 'customer' });
      }

      if (!defaultUser) {
        return this.errorResponse(res, 'System customer user not found for guest review mapping.', 500);
      }

      const fullComment = `${guestName}: ${comment}`;
      const review = await ProductService.addReview(productId, defaultUser._id, rating, fullComment);
      return this.successResponse(res, {
        message: 'Review submitted successfully! Thank you.',
        review
      });
    } catch (error) {
      return this.errorResponse(res, error.message);
    }
  }

  async quickView(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id).populate('category brand');
      if (!product) {
        return this.errorResponse(res, 'Product not found', 404);
      }
      return this.successResponse(res, product);
    } catch (error) {
      return this.errorResponse(res, error.message);
    }
  }
}

module.exports = new ProductController();
