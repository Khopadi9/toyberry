/**
 * config/mail.js
 * Nodemailer transporter configuration.
 * All credentials come from process.env — no hardcoded defaults for sensitive values.
 */

'use strict';

const nodemailer = require('nodemailer');
const constants = require('./constants');

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT, 10) || 587,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD
    }
  });

const sendMail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME || constants.APP_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to,
    subject,
    text: text || '',
    html: html || ''
  };

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Email send failed: ${error.message}`);
    return null;
  }
};

module.exports = { sendMail };
