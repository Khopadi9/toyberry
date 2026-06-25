const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },

  price: { type: Number, required: true },
  salePrice: { type: Number },
  stock: { type: Number, default: 0 },
  images: [{ type: String }],
  gallery360: [{ type: String }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', index: true },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  description: { type: String, required: true },
  shortDescription: { type: String },
  tags: [{ type: String }],
  specs: { type: Map, of: String }, // e.g. { ageGroup: "3-5 years", material: "Wood" }
  status: { type: String, enum: ['In Stock', 'Out of Stock'], default: 'In Stock' },
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  isDealOfTheWeek: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Enable text search index
ProductSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
