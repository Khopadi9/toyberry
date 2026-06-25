const BaseController = require('../base/BaseController');
const Product = require('../../models/Product');
const Category = require('../../models/Category');
const Brand = require('../../models/Brand');
const slugHelper = require('../../helpers/slugHelper');
const PaginationHelper = require('../../helpers/paginationHelper');

class AdminProductController extends BaseController {
  async list(req, res) {
    try {
      const { page: qPage } = req.query;
      const { page, limit, skip } = PaginationHelper.getPaginationParams(qPage, 10, 10);
      
      const total = await Product.countDocuments();
      const products = await Product.find()
        .populate('category brand')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const pagination = PaginationHelper.getPaginationMetadata(total, page, limit);

      return res.render('admin/products/index', {
        title: 'Product Management',
        products,
        pagination,
        layout: 'layouts/admin-layout'
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  }

  async addView(req, res) {
    try {
      const [categories, brands] = await Promise.all([
        Category.find({ status: 'Active' }),
        Brand.find({ status: 'Active' })
      ]);
      return res.render('admin/products/add', {
        title: 'Add New Product',
        categories,
        brands,
        layout: 'layouts/admin-layout'
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  }

  async addSubmit(req, res) {
    try {
      const { title, description, price, salePrice, stock, category, status, isDealOfTheWeek, discountPercentage } = req.body;

      if (!title || !price || !category) {
        return this.redirectResponse(req, res, '/admin/products/add', 'Error', 'Title, Price, and Category are required');
      }

      const parsedStock = parseInt(stock);
      if (isNaN(parsedStock) || parsedStock < 1) {
        return this.redirectResponse(req, res, '/admin/products/add', 'Error', 'Stock quantity must be a positive integer (minimum 1)');
      }

      const regPrice = parseFloat(price);
      if (isNaN(regPrice) || regPrice <= 0) {
        return this.redirectResponse(req, res, '/admin/products/add', 'Error', 'Regular price must be a valid number greater than 0');
      }

      let calculatedSalePrice = null;
      if (salePrice && salePrice.trim() !== '') {
        calculatedSalePrice = parseFloat(salePrice);
        if (isNaN(calculatedSalePrice) || calculatedSalePrice <= 0) {
          return this.redirectResponse(req, res, '/admin/products/add', 'Error', 'Sale price must be a valid number greater than 0');
        }
        if (calculatedSalePrice >= regPrice) {
          return this.redirectResponse(req, res, '/admin/products/add', 'Error', 'Sale price must be less than the regular price');
        }
      }

      // Handle uploaded images
      const images = [];
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          images.push(`/uploads/${file.filename}`);
        });
      }

      // Find or create Category dynamically from manual category string
      const categoryName = category ? category.trim() : 'General';
      let categoryObj = await Category.findOne({ name: { $regex: new RegExp('^' + categoryName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') } });
      if (!categoryObj) {
        const catSlug = slugHelper.generateSlug(categoryName);
        categoryObj = await Category.create({
          name: categoryName,
          slug: catSlug,
          status: 'Active'
        });
      }

      const slug = slugHelper.generateSlug(title);

      const dealChecked = isDealOfTheWeek === 'true' || isDealOfTheWeek === true || isDealOfTheWeek === 'on';

      if (dealChecked && discountPercentage) {
        const discountPct = parseFloat(discountPercentage);
        if (isNaN(discountPct) || discountPct <= 0 || discountPct > 100) {
          return this.redirectResponse(req, res, '/admin/products/add', 'Error', 'Discount percentage must be between 0 and 100');
        }
        calculatedSalePrice = parseFloat((regPrice * (1 - discountPct / 100)).toFixed(2));
      }

      const product = await Product.create({
        title,
        slug,
        price: regPrice,
        salePrice: calculatedSalePrice,
        stock: parsedStock,
        images,
        category: categoryObj._id,
        brand: undefined,
        description: description || title,
        shortDescription: description || title,
        tags: [],
        isFeatured: false,
        isNewArrival: false,
        isBestSeller: false,
        isTrending: false,
        isDealOfTheWeek: dealChecked,
        status: status || 'In Stock'
      });

      return this.redirectResponse(req, res, '/admin/products', 'Success', 'Product created successfully!');
    } catch (error) {
      console.error(error);
      return this.redirectResponse(req, res, '/admin/products/add', 'Error', error.message);
    }
  }

  async editView(req, res) {
    try {
      const { id } = req.params;
      const [product, categories, brands] = await Promise.all([
        Product.findById(id).populate('category'),
        Category.find({ status: 'Active' }),
        Brand.find({ status: 'Active' })
      ]);

      if (!product) {
        return res.status(404).send('Product not found');
      }

      return res.render('admin/products/edit', {
        title: `Edit: ${product.title}`,
        product,
        categories,
        brands,
        layout: 'layouts/admin-layout'
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  }

  async editSubmit(req, res) {
    try {
      const { id } = req.params;
      const { title, description, price, salePrice, stock, category, status, isDealOfTheWeek, discountPercentage } = req.body;

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).send('Product not found');
      }

      const parsedStock = parseInt(stock);
      if (isNaN(parsedStock) || parsedStock < 1) {
        return this.redirectResponse(req, res, `/admin/products/edit/${id}`, 'Error', 'Stock quantity must be a positive integer (minimum 1)');
      }

      const regPrice = parseFloat(price);
      if (isNaN(regPrice) || regPrice <= 0) {
        return this.redirectResponse(req, res, `/admin/products/edit/${id}`, 'Error', 'Regular price must be a valid number greater than 0');
      }

      let calculatedSalePrice = null;
      if (salePrice && salePrice.trim() !== '') {
        calculatedSalePrice = parseFloat(salePrice);
        if (isNaN(calculatedSalePrice) || calculatedSalePrice <= 0) {
          return this.redirectResponse(req, res, `/admin/products/edit/${id}`, 'Error', 'Sale price must be a valid number greater than 0');
        }
        if (calculatedSalePrice >= regPrice) {
          return this.redirectResponse(req, res, `/admin/products/edit/${id}`, 'Error', 'Sale price must be less than the regular price');
        }
      }

      // Handle uploaded images
      const images = [...product.images];
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          images.push(`/uploads/${file.filename}`);
        });
      }

      // Find or create Category dynamically from manual category string
      const categoryName = category ? category.trim() : 'General';
      let categoryObj = await Category.findOne({ name: { $regex: new RegExp('^' + categoryName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') } });
      if (!categoryObj) {
        const catSlug = slugHelper.generateSlug(categoryName);
        categoryObj = await Category.create({
          name: categoryName,
          slug: catSlug,
          status: 'Active'
        });
      }

      const slug = slugHelper.generateSlug(title);

      const dealChecked = isDealOfTheWeek === 'true' || isDealOfTheWeek === true || isDealOfTheWeek === 'on';

      if (dealChecked && discountPercentage) {
        const discountPct = parseFloat(discountPercentage);
        if (isNaN(discountPct) || discountPct <= 0 || discountPct > 100) {
          return this.redirectResponse(req, res, `/admin/products/edit/${id}`, 'Error', 'Discount percentage must be between 0 and 100');
        }
        calculatedSalePrice = parseFloat((regPrice * (1 - discountPct / 100)).toFixed(2));
      } else if (!dealChecked) {
        // If deals of week is unchecked, clear salePrice if it was deal-based, but preserve manual salePrice if not deal-based
        if (!salePrice || salePrice.trim() === '') {
          calculatedSalePrice = null;
        }
      }

      await Product.findByIdAndUpdate(id, {
        title,
        slug,
        price: regPrice,
        salePrice: calculatedSalePrice,
        stock: parsedStock,
        images,
        category: categoryObj._id,
        brand: undefined,
        description: description || title,
        shortDescription: description || title,
        tags: [],
        isFeatured: false,
        isNewArrival: false,
        isBestSeller: false,
        isTrending: false,
        isDealOfTheWeek: dealChecked,
        status
      });

      return this.redirectResponse(req, res, '/admin/products', 'Success', 'Product updated successfully!');
    } catch (error) {
      console.error(error);
      return this.redirectResponse(req, res, `/admin/products/edit/${req.params.id}`, 'Error', error.message);
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await Product.findByIdAndDelete(id);
      return this.successResponse(res, {}, 'Product deleted successfully!');
    } catch (error) {
      return this.errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new AdminProductController();
