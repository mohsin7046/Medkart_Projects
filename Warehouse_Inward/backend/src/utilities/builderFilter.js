
export const buildFilter = (filters, mapping) => {
  const where = {};

  for (const key in filters) {
    if (filters[key] !== undefined && mapping[key]) {
      const rule = mapping[key];

      if (rule.type === "string") {
        where[rule.field] = { contains: filters[key], mode: "insensitive" };
      } else if (rule.type === "exact") {
        where[rule.field] = filters[key];
      } else if (rule.type === "number") {
        where[rule.field] = Number(filters[key]);
      } else if (rule.type === "date") {
        where[rule.field] = new Date(filters[key]);
      }
    }
  }

  return where;
};
