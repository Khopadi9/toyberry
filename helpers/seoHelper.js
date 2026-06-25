'use strict';
const appConfig = require('../config/app');

class SEOHelper {
  static getMeta({ title, description, keywords, image, url, type = 'website' } = {}) {
    const siteName = appConfig.name;
    const finalTitle = title ? `${title} | ${siteName}` : siteName;
    const finalDesc = description || 'Premium and luxury kids toys at ToyBerry. Find educational, building, and action toys.';
    const finalKeywords = keywords || 'toys, kids toys, premium toys, educational toys, board games';
    const finalImage = image || `${appConfig.url}/images/logo.png`;
    const finalUrl = url || appConfig.url;

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
      "image": product.images && product.images.length > 0 ? `${appConfig.url}${product.images[0]}` : '',
      "description": product.shortDescription || product.description,
      "sku": product._id.toString(),
      "offers": {
        "@type": "Offer",
        "url": `${appConfig.url}/toys/${product.slug}`,
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
        "item": `${appConfig.url}${item.url}`
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
      "image": blog.image ? `${appConfig.url}${blog.image}` : '',
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
