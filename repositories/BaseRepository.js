class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async find(filter = {}, populate = '', select = '', sort = {}, limit = null, skip = null) {
    let query = this.model.find(filter);
    if (populate) query = query.populate(populate);
    if (select) query = query.select(select);
    if (sort) query = query.sort(sort);
    if (skip) query = query.skip(skip);
    if (limit) query = query.limit(limit);
    return await query.exec();
  }

  async findOne(filter = {}, populate = '', select = '') {
    let query = this.model.findOne(filter);
    if (populate) query = query.populate(populate);
    if (select) query = query.select(select);
    return await query.exec();
  }

  async findById(id, populate = '', select = '') {
    let query = this.model.findById(id);
    if (populate) query = query.populate(populate);
    if (select) query = query.select(select);
    return await query.exec();
  }

  async create(data) {
    const record = new this.model(data);
    return await record.save();
  }

  async update(id, data) {
    return await this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  async updateMany(filter, data) {
    return await this.model.updateMany(filter, data).exec();
  }

  async delete(id) {
    return await this.model.findByIdAndDelete(id).exec();
  }

  async count(filter = {}) {
    return await this.model.countDocuments(filter).exec();
  }
}

module.exports = BaseRepository;
