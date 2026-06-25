const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  image: { type: String, required: true },
  buttonText: { type: String, default: '' },
  buttonLink: { type: String, default: '' },
  cardSize: { type: String, enum: ['wide', 'narrow'], default: 'wide' },
  order: { type: Number, default: 1 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Collection', CollectionSchema);
