import { STATUSCODE } from "./constant.js";

export const handleAppError = (err, logger) => {
  let statusCode = STATUSCODE.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong";
  let data = null;

  switch (true) {

    case err.name === "ZodError":
      const validationErrors = err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      message = "Validation failed";
      data = validationErrors;
      statusCode = STATUSCODE.BAD_REQUEST;
      logger.error(`Zod Validation Error: ${JSON.stringify(validationErrors)}`);
      break;

    case !!err.validation_result:
      message = "GRN validation failed";
      data = err.validation_result;
      statusCode = STATUSCODE.BAD_REQUEST;
      logger.error(` GRN Validation Failed: ${JSON.stringify(err.validation_result.errors)}`);
      break;

    default:
      message = err.message || "Unexpected error occurred";
      logger.error(`${message}`);
      statusCode = err.statusCode || STATUSCODE.INTERNAL_SERVER_ERROR;
      break;
  }

  return { message, data, statusCode };
};
