export const validate = (schema) => (req, res, next) => {
  console.log(req.body);
  
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    next(err)
  }
};
