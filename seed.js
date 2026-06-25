const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const constants = require('./config/constants');

// Import all schemas
const User = require('./models/User');
const Category = require('./models/Category');
const Brand = require('./models/Brand');
const Product = require('./models/Product');
const FAQ = require('./models/FAQ');
const Testimonial = require('./models/Testimonial');
const Banner = require('./models/Banner');
const Blog = require('./models/Blog');

const seedData = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(constants.MONGODB_URI);
    }
    console.log('Database connected/ready for seeding...');

    // Clear old data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Brand.deleteMany({});
    // Keep existing products added by admin
    // await Product.deleteMany({});
    await FAQ.deleteMany({});
    await Testimonial.deleteMany({});
    await Banner.deleteMany({});
    await Blog.deleteMany({});
    console.log('Cleaned old database collections (excluding Products).');

    // 1. Create Users
    const admin = new User({
      name: 'ToyBerry Admin',
      email: 'toyberry',
      password: 'toyberryadmin@toyberry',
      role: 'admin',
      phone: '+91 98765 43210',
      isVerified: true
    });

    const customer = new User({
      name: 'Sarah Connor',
      email: 'customer@toyberry.com',
      password: 'CustomerPassword123!',
      role: 'customer',
      phone: '+91 99999 88888',
      isVerified: true,
      addresses: [
        {
          label: 'Home',
          addressLine1: '404 Luxury Heights, Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400050',
          country: 'India',
          isDefault: true
        }
      ]
    });

    await admin.save();
    await customer.save();
    console.log('Seeded Users: toyberry, customer@toyberry.com');

    // 2. Create Categories
    const categoriesData = [
      { name: 'Educational Toys', slug: 'educational-toys', image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=400', description: 'Brain teasers and creative learning sets' },
      { name: 'Building Blocks', slug: 'building-blocks', image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=400', description: 'Constructive building assemblies' },
      { name: 'Remote Control', slug: 'remote-control-toys', image: 'https://images.unsplash.com/photo-1532330393533-443990a51d10?auto=format&fit=crop&q=80&w=400', description: 'High-speed remote control vehicles' },
      { name: 'STEM Toys', slug: 'stem-toys', image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=400', description: 'Science, Technology, Engineering, and Math toys' },
      { name: 'Premium Collectibles', slug: 'premium-collectibles', image: 'https://images.unsplash.com/photo-1559251606-c623743a6d76?auto=format&fit=crop&q=80&w=400', description: 'Highly-detailed premium model kits' }
    ];
    const categories = await Category.insertMany(categoriesData);
    console.log('Seeded Categories.');

    // 3. Create Brands
    const brandsData = [
      { name: 'Lego', slug: 'lego', description: 'Universal brick system creators' },
      { name: 'Playmobil', slug: 'playmobil', description: 'High-quality storytelling figures' },
      { name: 'Hot Wheels', slug: 'hot-wheels', description: 'Authentic metal diecast vehicles' },
      { name: 'STEMCraft', slug: 'stemcraft', description: 'Certified educational science structures' },
      { name: 'ToyBerry Custom', slug: 'toyberry-custom', description: 'Organic luxury wood selections' }
    ];
    const brands = await Brand.insertMany(brandsData);
    console.log('Seeded Brands.');

    // Resolve IDs
    const catMap = {};
    categories.forEach(c => { catMap[c.slug] = c._id; });

    const brandMap = {};
    brands.forEach(b => { brandMap[b.slug] = b._id; });

    // 4. Create Premium Products (Clean Seed) - Disabled to protect admin added data
    const productsData = [];

    if (productsData.length > 0) {
      await Product.insertMany(productsData);
      console.log('Seeded Products catalog.');
    }

    // 5. Create Banners
    const bannersData = [
      {
        title: 'Spark Creative Play',
        subtitle: 'Shop the premium wooden building blocks collection designed to nurture spatial skills.',
        image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=1200',
        link: '/toys?category=educational-toys'
      },
      {
        title: 'Futuristic STEM Kits',
        subtitle: 'Discover child-safe electronics, robotics, and coding kits with sub-second shipping.',
        image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=1200',
        link: '/toys?category=stem-toys'
      }
    ];
    await Banner.insertMany(bannersData);
    console.log('Seeded Hero Banners.');

    // 6. Create Testimonials
    const testimonialsData = [
      {
        customerName: 'Aria Montgomery',
        designation: 'Mother of Two',
        feedback: 'The Wooden Castle set has kept my kids busy for days. Absolutely love the smooth organic wood texture and packaging!',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100'
      },
      {
        customerName: 'David Miller',
        designation: 'STEM Educator',
        feedback: 'The AI Smart Rover is the best introductory tool for robotics. Clean code libraries and intuitive hardware layouts.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100'
      }
    ];
    await Testimonial.insertMany(testimonialsData);
    console.log('Seeded Testimonials.');

    // 7. Create FAQs
    const faqsData = [
      {
        question: 'Are all ToyBerry toys safe for toddlers?',
        answer: 'Yes! Every product listed undergoes certified ASTM and EN71 toxicity checks. We ensure materials are non-toxic, child-safe, and free of small hazards for the recommended age groups.'
      },
      {
        question: 'What is your shipping policy?',
        answer: 'We provide free shipping on orders over ₹2000. Standard delivery times are 2-4 business days across India. tracking codes are sent via email.'
      },
      {
        question: 'Do you offer a satisfaction guarantee?',
        answer: 'We offer an easy 30-day return policy. If you or your child are not fully satisfied, you can initiate a return for a complete refund or exchange.'
      }
    ];
    await FAQ.insertMany(faqsData);
    console.log('Seeded FAQs.');

    // 8. Create Blogs
    const blogsData = [
      {
        title: 'The Power of Play: How STEM Toys Shape Early Brains',
        slug: 'the-power-of-play-stem-toys',
        content: 'Play is often talked about as if it were a relief from serious learning. But for children play is serious learning. Play is really the work of childhood. STEM toys are specifically designed to bridge the gap between creative curiosity and technical learning. Spatial skills developed during interlocking block building are linked to higher academic success in calculus and mechanical analysis later in life...',
        author: 'Dr. Evelyn Carter',
        category: 'Child Development',
        image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=600',
        tags: ['stem', 'playtime', 'brain-growth']
      }
    ];
    await Blog.insertMany(blogsData);
    console.log('Seeded Blogs.');

    console.log('All Seeding Complete!');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (err) {
    console.error('Seeding Error:', err);
    if (require.main === module) {
      process.exit(1);
    }
    throw err;
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
