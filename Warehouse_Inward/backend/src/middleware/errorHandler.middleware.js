import { errorResponse } from "../utilities/response.js";
import { productLogger, vendorLogger, poLogger, grnLogger, piLogger, appLogger,saleLogger,indentLogger } from "../utilities/logger.js";
import { STATUSCODE } from "../utilities/constant.js";

const loggerMap = {
  "product": productLogger,
  "vendor": vendorLogger,
  "po": poLogger,
  "grn": grnLogger,
  "pi": piLogger,
  "app": appLogger,
  "so": saleLogger,
  "si":indentLogger
};

export const errorHandler = (err, req, res,next) => {
  const component = req.component || "app";
  const logger = loggerMap[component] || appLogger;

  if (err.name === "ZodError") {
    const validationErrors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    logger.error(`Validation Error: ${JSON.stringify(validationErrors)}`);

    return errorResponse(res, validationErrors || "Validation error", STATUSCODE.BAD_REQUEST);
  }

  logger.error(err.message || "Unexpected error");

  return errorResponse(
    res,
    err.message || "Something went wrong",
    err.statusCode || STATUSCODE.INTERNAL_SERVER_ERROR
  );
};
