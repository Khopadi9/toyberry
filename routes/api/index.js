const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');

router.get('/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date(),
    app: 'ToyBerry Premium API'
  });
});

router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({ status: 'Active' }).limit(10).populate('category brand');
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
