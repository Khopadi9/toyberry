/**
 * env.js — Single source of truth for all environment variables.
 * All process.env reads happen here and nowhere else.
 * dotenv must be called before this module is loaded (done in app.js entry point).
 */

'use strict';

function required(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(key, fallback) {
  return process.env[key] || fallback;
}

module.exports = {
  // Application
  NODE_ENV:        optional('NODE_ENV', 'development'),
  PORT:            parseInt(optional('PORT', '3000'), 10),
  BASE_URL:        optional('BASE_URL', 'http://localhost:3000'),

  // Database
  MONGODB_URI:     required('MONGODB_URI'),

  // Session
  SESSION_SECRET:  required('SESSION_SECRET'),

  // Mail (all optional — app still works without mailer configured)
  MAIL_HOST:         optional('MAIL_HOST', ''),
  MAIL_PORT:         parseInt(optional('MAIL_PORT', '2525'), 10),
  MAIL_USERNAME:     optional('MAIL_USERNAME', ''),
  MAIL_PASSWORD:     optional('MAIL_PASSWORD', ''),
  MAIL_FROM_NAME:    optional('MAIL_FROM_NAME', 'ToyBerry'),
  MAIL_FROM_ADDRESS: optional('MAIL_FROM_ADDRESS', 'noreply@toyberry.com'),

  // Helpers
  isProduction() { return this.NODE_ENV === 'production'; },
  isDevelopment() { return this.NODE_ENV === 'development'; }
};
