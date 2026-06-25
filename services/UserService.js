const UserRepository = require('../repositories/UserRepository');
const crypto = require('crypto');
const mailConfig = require('../config/mail');

class UserService {
  async register({ name, email, password, phone }) {
    const existing = await UserRepository.findByEmail(email);
    if (existing) {
      throw new Error('Email is already registered');
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await UserRepository.create({
      name,
      email,
      password,
      phone,
      otp: { code: otpCode, expiresAt: otpExpires }
    });

    // Send OTP email
    await mailConfig.sendMail({
      to: email,
      subject: 'Verify Your ToyBerry Account',
      html: `<h3>Welcome to ToyBerry, ${name}!</h3>
             <p>Your OTP code for email verification is: <strong>${otpCode}</strong></p>
             <p>This code expires in 10 minutes.</p>`
    });

    return user;
  }

  async login(email, password) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error('Invalid email or password');
    if (!user.isActive) throw new Error('Your account has been deactivated');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error('Invalid email or password');

    return user;
  }

  async verifyOTP(email, code) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error('User not found');

    if (user.otp.code === code && user.otp.expiresAt > new Date()) {
      user.isVerified = true;
      user.otp = undefined; // Clear OTP
      await user.save();
      return user;
    } else {
      throw new Error('Invalid or expired OTP code');
    }
  }

  async sendForgotPasswordOTP(email) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error('No account found with this email');

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.otp = { code: otpCode, expiresAt: otpExpires };
    await user.save();

    await mailConfig.sendMail({
      to: email,
      subject: 'ToyBerry Password Reset OTP',
      html: `<p>We received a request to reset your password.</p>
             <p>Your OTP code is: <strong>${otpCode}</strong></p>
             <p>This code will expire in 10 minutes.</p>`
    });
  }

  async resetPassword(email, code, newPassword) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error('User not found');

    if (user.otp.code === code && user.otp.expiresAt > new Date()) {
      user.password = newPassword;
      user.otp = undefined;
      await user.save();
      return user;
    } else {
      throw new Error('Invalid or expired OTP code');
    }
  }

  async addAddress(userId, addressData) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new Error('User not found');

    if (addressData.isDefault) {
      user.addresses.forEach(addr => { addr.isDefault = false; });
    }

    user.addresses.push(addressData);
    await user.save();
    return user.addresses;
  }

  async removeAddress(userId, addressId) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new Error('User not found');

    user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
    await user.save();
    return user.addresses;
  }
}

module.exports = new UserService();
