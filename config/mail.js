const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.MAIL_PORT || 2525,
  auth: {
    user: process.env.MAIL_USERNAME || '',
    pass: process.env.MAIL_PASSWORD || ''
  }
});

const sendMail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME || 'ToyBerry'}" <${process.env.MAIL_FROM_ADDRESS || 'noreply@toyberry.com'}>`,
    to,
    subject,
    text: text || '',
    html: html || ''
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Email send failed: ${error.message}`);
    return null;
  }
};

module.exports = {
  transporter,
  sendMail
};
