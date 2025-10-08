
import { errorResponse } from "../utilities/response.js";
import { handleAppError } from "../utilities/errorHandler.util.js";
import { 
  productLogger, vendorLogger, poLogger, grnLogger,
  piLogger, appLogger, saleLogger, indentLogger,
  purchaseindentLogger, gatePassLogger 
} from "../utilities/logger.js";

const loggerMap = {
  product: productLogger,
  vendor: vendorLogger,
  po: poLogger,
  grn: grnLogger,
  pi: piLogger,
  app: appLogger,
  so: saleLogger,
  si: indentLogger,
  purchaseindent: purchaseindentLogger,
  gatepass: gatePassLogger,
};

export const errorHandler = (err, req, res, next) => {
  const component = req.component || "app";
  const logger = loggerMap[component] || appLogger;

  const { message, data, statusCode } = handleAppError(err, logger);

  console.log(message, data, statusCode );
  

  return errorResponse(res, data || message, statusCode);
};
