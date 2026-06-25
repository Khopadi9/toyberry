const BaseController = require('../base/BaseController');
const Blog = require('../../models/Blog');

class BlogController extends BaseController {
  async list(req, res) {
    try {
      const { search, category, tag } = req.query;
      const filter = { status: 'Published' };

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ];
      }

      if (category) {
        filter.category = category;
      }

      if (tag) {
        filter.tags = tag;
      }

      const [blogs, categories, popular] = await Promise.all([
        Blog.find(filter).sort({ createdAt: -1 }),
        Blog.distinct('category', { status: 'Published' }),
        Blog.find({ status: 'Published' }).sort({ createdAt: -1 }).limit(4) // fallback for popular
      ]);

      return res.render('pages/blog', {
        title: 'Blog',
        blogs,
        categories,
        popular,
        filters: { search, category, tag },
        seo: {
          title: 'ToyBerry Blog - Premium Toys Insights & Guides',
          description: 'Read the latest trends, guides, and insights on educational toys, parenting, and kid play.'
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
      const blog = await Blog.findOne({ slug, status: 'Published' });
      if (!blog) {
        return res.status(404).render('pages/404', { title: 'Blog Not Found', seo: { title: 'Not Found | ToyBerry' } });
      }

      const [popular, related] = await Promise.all([
        Blog.find({ status: 'Published', _id: { $ne: blog._id } }).sort({ createdAt: -1 }).limit(4),
        Blog.find({ status: 'Published', category: blog.category, _id: { $ne: blog._id } }).limit(3)
      ]);

      return res.render('pages/blog-detail', {
        title: blog.title,
        blog,
        popular,
        related,
        seo: {
          title: blog.metaTitle || `${blog.title} | ToyBerry`,
          description: blog.metaDescription || blog.content.substring(0, 150),
          keywords: blog.metaKeywords || (blog.tags ? blog.tags.join(', ') : '')
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  }
}

module.exports = new BlogController();
