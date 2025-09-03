export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
     console.error("❌ ERROR from tryCatch:", err.message || err);

      next(err)
    }
  )
  }
}
