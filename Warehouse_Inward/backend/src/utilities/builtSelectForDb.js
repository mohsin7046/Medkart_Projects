export const buildSelect = (fields) => {
  const select = {};
  const include = {};

  fields.forEach(field => {
    if (typeof field === "string" && field.includes(":")) {
      const [relation, relField] = field.split(":");
      select[relation] = { select: { [relField]: true } };
    } else if (typeof field === "string") {
      select[field] = true;
    } else if (typeof field === "object") {
      if (field.include) {
        Object.assign(include, field.include);
      } else {
        Object.assign(select, field);
      }
    }
  });

  return { select, include };
};

