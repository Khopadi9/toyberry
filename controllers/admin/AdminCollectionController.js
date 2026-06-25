const Collection = require('../../models/Collection');
const fs = require('fs');
const path = require('path');

const sortCollections = (collections) => {
  const unordered = collections.filter(c => {
    const o = parseInt(c.order);
    return isNaN(o) || o <= 0;
  });
  unordered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const ordered = collections.filter(c => {
    const o = parseInt(c.order);
    return !isNaN(o) && o > 0;
  });
  ordered.sort((a, b) => parseInt(a.order) - parseInt(b.order));

  const result = [...unordered];
  for (const item of ordered) {
    const targetIndex = parseInt(item.order) - 1;
    if (targetIndex >= result.length) {
      result.push(item);
    } else {
      result.splice(targetIndex, 0, item);
    }
  }
  return result;
};

exports.list = async (req, res) => {
  try {
    const rawCollections = await Collection.find();
    const collections = sortCollections(rawCollections);
    res.render('admin/collections/index', {
      title: 'Collection Management',
      collections,
      layout: 'layouts/admin-layout'
    });
  } catch (error) {
    req.flash('error_msg', error.message);
    res.redirect('/admin/dashboard');
  }
};

exports.addView = (req, res) => {
  res.render('admin/collections/add', {
    title: 'Add Collection Item',
    layout: 'layouts/admin-layout'
  });
};

exports.addSubmit = async (req, res) => {
  try {
    const { title, subtitle, buttonText, buttonLink, cardSize, order, status } = req.body;
    let imagePath = '';

    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    } else {
      throw new Error('Please upload a background image for the collection.');
    }

    const parsedOrder = parseInt(order);
    const collection = new Collection({
      title: title || '',
      subtitle: subtitle || '',
      image: imagePath,
      buttonText: buttonText || '',
      buttonLink: buttonLink || '',
      cardSize: cardSize || 'wide',
      order: parsedOrder || 0,
      status: status || 'Active'
    });

    await collection.save();
    req.session.toast = { type: 'Success', message: 'Collection created successfully!' };
    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
      res.redirect('/admin/collections');
    });
  } catch (error) {
    res.render('admin/collections/add', {
      title: 'Add Collection Item',
      error: error.message,
      layout: 'layouts/admin-layout'
    });
  }
};

exports.editView = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).send('Collection not found');
    }
    res.render('admin/collections/edit', {
      title: 'Edit Collection Item',
      collection,
      layout: 'layouts/admin-layout'
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.editSubmit = async (req, res) => {
  try {
    const { title, subtitle, buttonText, buttonLink, cardSize, order, status } = req.body;
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      throw new Error('Collection not found.');
    }

    const parsedOrder = parseInt(order);

    collection.title = title || '';
    collection.subtitle = subtitle || '';
    collection.buttonText = buttonText || '';
    collection.buttonLink = buttonLink || '';
    collection.cardSize = cardSize || 'wide';
    collection.order = parsedOrder || 0;
    collection.status = status || 'Active';

    if (req.file) {
      if (collection.image && collection.image.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', '..', 'public', collection.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      collection.image = `/uploads/${req.file.filename}`;
    }

    await collection.save();
    req.session.toast = { type: 'Success', message: 'Collection updated successfully!' };
    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
      res.redirect('/admin/collections');
    });
  } catch (error) {
    const collection = await Collection.findById(req.params.id);
    res.render('admin/collections/edit', {
      title: 'Edit Collection Item',
      collection,
      error: error.message,
      layout: 'layouts/admin-layout'
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    if (collection.image && collection.image.startsWith('/uploads/')) {
      const imgPath = path.join(__dirname, '..', '..', 'public', collection.image);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    await Collection.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Collection deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
