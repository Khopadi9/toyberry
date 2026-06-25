const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return await this.findOne({ email });
  }

  async findByOTP(code) {
    return await this.findOne({ 'otp.code': code, 'otp.expiresAt': { $gt: new Date() } });
  }
}

module.exports = new UserRepository();
