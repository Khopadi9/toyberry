const mongoose = require('mongoose');
const constants = require('./constants');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(constants.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Check if seeding is required (if new admin user 'toyberry' does not exist)
    const Product = require('../models/Product');
    const User = require('../models/User');
    
    // Drop old sku_1 index if it exists in the products collection
    try {
      await mongoose.connection.db.collection('products').dropIndex('sku_1');
      console.log('Successfully dropped old sku_1 index');
    } catch (err) {
      // Index may not exist, safe to ignore
    }

    // Automatically clean up seeded products to preserve admin added products only
    try {
      const deleteResult = await Product.deleteMany({
        slug: {
          $in: [
            'montessori-wooden-rainbow-stacker',
            'magnetic-geometry-learning-blocks',
            'organic-wooden-animal-puzzle',
            'deluxe-wood-abacus-math-trainer',
            'cyberpunk-creator-lego-set',
            'medieval-kingdom-castle-builder',
            'space-exploration-rocket-base',
            'neo-city-architect-skyscraper-kit',
            'desert-storm-4wd-rc-buggy',
            'aero-glider-remote-control-helicopter',
            'speed-racer-formula-1-rc-car',
            'monster-truck-offroad-crawler',
            'ai-smart-rover-coding-robot',
            'solar-powered-engineering-rover-kit',
            'wind-turbine-mechanical-science-set',
            'diy-chemistry-crystal-growing-lab',
            'solid-mahogany-luxury-chess-board',
            'hand-painted-vintage-steam-locomotive',
            'antique-brass-pocket-orrery',
            'precision-cast-alloy-fighter-jet-model'
          ]
        }
      });
      if (deleteResult.deletedCount > 0) {
        console.log(`Cleaned up ${deleteResult.deletedCount} seed products from database.`);
      }
    } catch (err) {
      console.error('Error cleaning up seed products:', err);
    }

    const adminExists = await User.findOne({ email: 'toyberry' });
    if (!adminExists) {
      console.log('Admin user "toyberry" not found. Re-seeding database with premium credentials...');
      const seedData = require('../seed');
      await seedData();
      console.log('Database auto-seeded successfully!');
    }
    
    // Seed default collections if none exist
    const Collection = require('../models/Collection');
    const collectionCount = await Collection.countDocuments();
    if (collectionCount === 0) {
      console.log('Seeding default collections...');
      await Collection.insertMany([
        {
          title: 'The Artisan Playroom',
          subtitle: 'Heirloom furniture and structural play sets.',
          image: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&q=80&w=1200',
          buttonText: 'Explore Now',
          buttonLink: '/toys?category=educational-toys',
          cardSize: 'wide',
          order: 1,
          status: 'Active'
        },
        {
          title: 'Early Learning',
          subtitle: 'Montessori-inspired essentials.',
          image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800',
          buttonText: '',
          buttonLink: '/toys?category=educational-toys',
          cardSize: 'narrow',
          order: 2,
          status: 'Active'
        },
        {
          title: 'Soft Companions',
          subtitle: 'Organic cotton plushies.',
          image: 'https://images.unsplash.com/photo-1583556133246-a3630f9a21d1?auto=format&fit=crop&q=80&w=800',
          buttonText: '',
          buttonLink: '/toys?search=plush',
          cardSize: 'narrow',
          order: 3,
          status: 'Active'
        },
        {
          title: 'Collector\'s Edition',
          subtitle: 'Limited runs for the discerning enthusiast.',
          image: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=1200',
          buttonText: 'Discover More',
          buttonLink: '/toys?sort=price-desc',
          cardSize: 'wide',
          order: 4,
          status: 'Active'
        }
      ]);
      console.log('Default collections seeded successfully.');
    }
    

  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
