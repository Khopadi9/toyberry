const Banner = require('../../models/Banner');
const fs = require('fs');
const path = require('path');
const constants = require('../../config/constants');

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

exports.list = async (req, res) => {
  try {
    const rawBanners = await Banner.find();
    const banners = sortBanners(rawBanners);
    res.render('admin/banners/index', {
      title: 'Carousel Management',
      banners,
      layout: 'layouts/admin-layout'
    });
  } catch (error) {
    req.flash('error_msg', error.message);
    res.redirect('/admin/dashboard');
  }
};

exports.addView = (req, res) => {
  res.render('admin/banners/add', {
    title: 'Add Carousel Item',
    layout: 'layouts/admin-layout'
  });
};

exports.addSubmit = async (req, res) => {
  try {
    const { title, subtitle, link, order, status } = req.body;
    let imagePath = '';

    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    } else {
      throw new Error('Please upload an image for the carousel item.');
    }

    const parsedOrder = parseInt(order);
    if (!isNaN(parsedOrder) && parsedOrder > 0) {
      const count = await Banner.countDocuments();
      if (parsedOrder > count + 1) {
        throw new Error(`Invalid display order. You currently have ${count} slide(s), so the order cannot be greater than ${count + 1}.`);
      }
    }

    const banner = new Banner({
      title,
      subtitle,
      image: imagePath,
      link: link || '',
      order: parsedOrder || 0,
      status: status || 'Active'
    });

    await banner.save();
    req.session.toast = { type: 'Success', message: 'Carousel item created successfully!' };
    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
      res.redirect('/admin/banners');
    });
  } catch (error) {
    res.render('admin/banners/add', {
      title: 'Add Carousel Item',
      error: error.message,
      layout: 'layouts/admin-layout'
    });
  }
};

exports.editView = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).send('Carousel item not found');
    }
    res.render('admin/banners/edit', {
      title: 'Edit Carousel Item',
      banner,
      layout: 'layouts/admin-layout'
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.editSubmit = async (req, res) => {
  try {
    const { title, subtitle, link, order, status } = req.body;
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      throw new Error('Carousel item not found.');
    }

    const parsedOrder = parseInt(order);
    if (!isNaN(parsedOrder) && parsedOrder > 0) {
      const count = await Banner.countDocuments();
      if (parsedOrder > count) {
        throw new Error(`Invalid display order. You currently have ${count} slide(s), so the order cannot be greater than ${count}.`);
      }
    }

    banner.title = title;
    banner.subtitle = subtitle;
    banner.link = link || '';
    banner.order = parsedOrder || 0;
    banner.status = status || 'Active';

    if (req.file) {
      // Optional: Delete old image from server
      if (banner.image && banner.image.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', '..', 'public', banner.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      banner.image = `/uploads/${req.file.filename}`;
    }

    await banner.save();
    req.session.toast = { type: 'Success', message: 'Carousel item updated successfully!' };
    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
      res.redirect('/admin/banners');
    });
  } catch (error) {
    const banner = await Banner.findById(req.params.id);
    res.render('admin/banners/edit', {
      title: 'Edit Carousel Item',
      banner,
      error: error.message,
      layout: 'layouts/admin-layout'
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Carousel item not found' });
    }

    // Delete image from disk
    if (banner.image && banner.image.startsWith('/uploads/')) {
      const imgPath = path.join(__dirname, '..', '..', 'public', banner.image);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Carousel item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
