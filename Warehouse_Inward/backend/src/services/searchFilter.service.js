export const searchAndFilter = async (model, query = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const whereCondition = {
    deleted_at: null,
    ...query,
  };

  const [items, totalItems] = await Promise.all([
    model.findMany({
      where: whereCondition,
      skip,
      take: Number(limit),
    }),
    model.count({
      where: whereCondition,
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data: items,
    metadata: {
      page,
      limit,
      totalPages,
      totalItems,
    },
  };
};
