class PaginationHelper {
  static getPaginationParams(queryPage, queryLimit, defaultLimit = 12) {
    const page = Math.max(1, parseInt(queryPage) || 1);
    const limit = Math.max(1, parseInt(queryLimit) || defaultLimit);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }

  static getPaginationMetadata(totalItems, page, limit) {
    const totalPages = Math.ceil(totalItems / limit) || 1;
    return {
      totalItems,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page + 1,
      prevPage: page - 1
    };
  }
}

module.exports = PaginationHelper;
