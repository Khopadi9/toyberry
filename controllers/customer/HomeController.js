const BaseController = require('../base/BaseController');
const ProductService = require('../../services/ProductService');
const CategoryService = require('../../services/CategoryService');
const Banner = require('../../models/Banner');
const Collection = require('../../models/Collection');
const Testimonial = require('../../models/Testimonial');
const FAQ = require('../../models/FAQ');
const Blog = require('../../models/Blog');
const Brand = require('../../models/Brand');
const Contact = require('../../models/Contact');
const Newsletter = require('../../models/Newsletter');
const Product = require('../../models/Product');
const PaginationHelper = require('../../helpers/paginationHelper');

const sortBanners = (banners) => {
  const unordered = banners.filter(b => {
    const o = parseInt(b.order);
    return isNaN(o) || o <= 0;
  });
  unordered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const ordered = banners.filter(b => {
    const o = parseInt(b.order);
    return !isNaN(o) && o > 0;
  });
  ordered.sort((a, b) => parseInt(a.order) - parseInt(b.order));

  const result = [...unordered];
  for (const banner of ordered) {
    const targetIndex = parseInt(banner.order) - 1;
    if (targetIndex >= result.length) {
      result.push(banner);
    } else {
      result.splice(targetIndex, 0, banner);
    }
  }
  return result;
};

const sortCollections = (collections) => {
  const unordered = collections.filter(c => {
    const o = parseInt(c.order);
    return isNaN(o) || o <= 0;
  });
  unordered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const ordered = collections.filter(c => {
    const o = parseInt(c.order);
    return !isNaN(o) && o > 0;
  });
  ordered.sort((a, b) => parseInt(a.order) - parseInt(b.order));

  const result = [...unordered];
  for (const item of ordered) {
    const targetIndex = parseInt(item.order) - 1;
    if (targetIndex >= result.length) {
      result.push(item);
    } else {
      result.splice(targetIndex, 0, item);
    }
  }
  return result;
};

class HomeController extends BaseController {
  async index(req, res) {
    try {
      const qPage = req.query.page;
      const { page, limit, skip } = PaginationHelper.getPaginationParams(qPage, null, 12);

      const [rawBanners, rawCollections, categories, brands, toys, testimonials, faqs, blogs, paginatedProducts] = await Promise.all([
        Banner.find({ status: 'Active' }),
        Collection.find({ status: 'Active', image: { $exists: true, $nin: ['', null] } }),
        CategoryService.getAllActive(),
        Brand.find({ status: 'Active' }).limit(6),
        ProductService.getHomeProducts(),
        Testimonial.find({ status: 'Active' }).limit(5),
        FAQ.find({ status: 'Active' }).sort({ order: 1 }).limit(6),
        Blog.find({ status: 'Published' }).sort({ createdAt: -1 }).limit(3),
        Product.find({ status: { $ne: 'Inactive' } })
          .populate('category brand')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
      ]);

      const total = await Product.countDocuments({ status: { $ne: 'Inactive' } });
      const pagination = PaginationHelper.getPaginationMetadata(total, page, limit);

      const banners = sortBanners(rawBanners);
      const collections = sortCollections(rawCollections);

      return res.render('pages/home', {
        title: 'Premium Toys Store',
        banners,
        collections,
        categories,
        brands,
        toys,
        testimonials,
        faqs,
        blogs,
        paginatedProducts,
        pagination,
        seo: {
          title: 'ToyBerry - Premium & Luxury Toys E-Commerce Website',
          description: 'Shop premium, luxury, and educational toys at ToyBerry. Building blocks, remote control, STEM, puzzles, and board games.',
          keywords: 'premium toys, educational toys, board games, kids toys'
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  }

  async contactView(req, res) {
    return res.render('pages/contact', {
      title: 'Contact Us',
      seo: { title: 'Contact Us | ToyBerry' }
    });
  }

  async aboutView(req, res) {
    return res.render('pages/about', {
      title: 'About Us',
      seo: { title: 'About Us | ToyBerry' }
    });
  }

  async shippingPolicyView(req, res) {
    return res.render('pages/shipping-policy', {
      title: 'Shipping Policy',
      seo: { title: 'Shipping Policy | ToyBerry' }
    });
  }

  async returnPolicyView(req, res) {
    return res.render('pages/return-policy', {
      title: 'Return & Refund Policy',
      seo: { title: 'Return & Refund Policy | ToyBerry' }
    });
  }

  async termsConditionsView(req, res) {
    return res.render('pages/terms-conditions', {
      title: 'Terms & Conditions',
      seo: { title: 'Terms & Conditions | ToyBerry' }
    });
  }

  async privacyPolicyView(req, res) {
    return res.render('pages/privacy-policy', {
      title: 'Privacy Policy',
      seo: { title: 'Privacy Policy | ToyBerry' }
    });
  }

  async contactSubmit(req, res) {
    try {
      const { name, email, subject, message } = req.body;
      if (!name || !email || !message) {
        return this.errorResponse(res, 'Name, Email, and Message are required', 400);
      }

      await Contact.create({ name, email, subject, message });
      return this.successResponse(res, { message: 'Message sent successfully! We will get back to you soon.' });
    } catch (error) {
      return this.errorResponse(res, 'Failed to save contact message: ' + error.message);
    }
  }

  async newsletterSubscribe(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return this.errorResponse(res, 'Email address is required', 400);
      }

      const existing = await Newsletter.findOne({ email });
      if (existing) {
        if (existing.status === 'Subscribed') {
          return this.successResponse(res, { message: 'You are already subscribed to our newsletter!' });
        }
        existing.status = 'Subscribed';
        await existing.save();
      } else {
        await Newsletter.create({ email });
      }

      return this.successResponse(res, { message: 'Thank you for subscribing to our newsletter!' });
    } catch (error) {
      return this.errorResponse(res, 'Subscription failed: ' + error.message);
    }
  }
}

module.exports = new HomeController();
