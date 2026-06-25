const constants = require('../config/constants');

class SEOHelper {
  static getMeta({ title, description, keywords, image, url, type = 'website' } = {}) {
    const siteName = constants.APP_NAME;
    const finalTitle = title ? `${title} | ${siteName}` : siteName;
    const finalDesc = description || 'Premium and luxury kids toys at ToyBerry. Find educational, building, and action toys.';
    const finalKeywords = keywords || 'toys, kids toys, premium toys, educational toys, board games';
    const finalImage = image || `${constants.BASE_URL}/images/logo.png`;
    const finalUrl = url || constants.BASE_URL;

    return `
      <title>${finalTitle}</title>
      <meta name="description" content="${finalDesc}">
      <meta name="keywords" content="${finalKeywords}">
      <link rel="canonical" href="${finalUrl}">
      
      <!-- Open Graph / Facebook -->
      <meta property="og:type" content="${type}">
      <meta property="og:url" content="${finalUrl}">
      <meta property="og:title" content="${finalTitle}">
      <meta property="og:description" content="${finalDesc}">
      <meta property="og:image" content="${finalImage}">
      <meta property="og:site_name" content="${siteName}">

      <!-- Twitter -->
      <meta property="twitter:card" content="summary_large_image">
      <meta property="twitter:url" content="${finalUrl}">
      <meta property="twitter:title" content="${finalTitle}">
      <meta property="twitter:description" content="${finalDesc}">
      <meta property="twitter:image" content="${finalImage}">
    `;
  }

  static getProductSchema(product) {
    if (!product) return '';
    const schema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.title,
      "image": product.images && product.images.length > 0 ? `${constants.BASE_URL}${product.images[0]}` : '',
      "description": product.shortDescription || product.description,
      "sku": product._id.toString(),
      "offers": {
        "@type": "Offer",
        "url": `${constants.BASE_URL}/toys/${product.slug}`,
        "priceCurrency": "USD",
        "price": product.salePrice || product.price,
        "itemCondition": "https://schema.org/NewCondition",
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      }
    };
    if (product.ratingCount > 0) {
      schema.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": product.rating,
        "reviewCount": product.ratingCount
      };
    }
    return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  }

  static getBreadcrumbSchema(items) {
    // items: Array of { name, url }
    if (!items || items.length === 0) return '';
    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": `${constants.BASE_URL}${item.url}`
      }))
    };
    return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  }

  static getFAQSchema(faqs) {
    if (!faqs || faqs.length === 0) return '';
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
    return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  }

  static getBlogSchema(blog) {
    if (!blog) return '';
    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": blog.title,
      "image": blog.image ? `${constants.BASE_URL}${blog.image}` : '',
      "datePublished": blog.createdAt,
      "dateModified": blog.updatedAt,
      "author": {
        "@type": "Person",
        "name": blog.author || 'Admin'
      }
    };
    return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  }
}

module.exports = SEOHelper;
