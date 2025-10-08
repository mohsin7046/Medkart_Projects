
export const setEntity = (entity) => (req, res, next) => {
  req.component = entity;
  next();
};
