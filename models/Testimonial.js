const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  designation: { type: String, default: 'Happy Parent' },
  feedback: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
  image: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Testimonial', TestimonialSchema);
