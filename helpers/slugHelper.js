const slugify = require('slugify');

const generateSlug = (text) => {
  if (!text) return '';
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true
  });
};

module.exports = {
  generateSlug
};
