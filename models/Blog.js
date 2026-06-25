const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  content: { type: String, required: true },
  image: { type: String },
  category: { type: String, required: true },
  tags: [{ type: String }],
  author: { type: String, default: 'Admin' },
  status: { type: String, enum: ['Published', 'Draft'], default: 'Draft' },
  metaTitle: { type: String },
  metaDescription: { type: String },
  metaKeywords: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Blog', BlogSchema);
