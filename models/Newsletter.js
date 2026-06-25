const mongoose = require('mongoose');

const NewsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  status: { type: String, enum: ['Subscribed', 'Unsubscribed'], default: 'Subscribed' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Newsletter', NewsletterSchema);
