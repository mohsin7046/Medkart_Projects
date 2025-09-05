import { ZodError } from "zod";
import { StatusCodes } from "http-status-codes";

export const errorHandler = (err, req, res) => {
  // ✅ Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors = {};
    err.errors.forEach((issue) => {
      const field = issue.path.join(".");
      errors[field] = issue.message;
    });

    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  // ✅ Handle known errors with statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message || "Something went wrong"
    });
  }

  // ✅ Handle unexpected errors
  console.error("🔥 Unhandled Error:", err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Internal server error"
  });
};