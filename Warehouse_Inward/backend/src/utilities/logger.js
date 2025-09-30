import { createLogger, format, transports } from "winston";
import path from "path";
import fs from "fs";

const logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const baseFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ level, message, timestamp }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
);


const createModuleLogger = (moduleName) => {
  return createLogger({
    level: "info",
    format: baseFormat,
    transports: [
      new transports.Console(),
      new transports.File({ filename: path.join(logDir, `${moduleName}.log`) }), 
      new transports.File({ filename: path.join(logDir, "error.log"), level: "error" }), 
      new transports.File({ filename: path.join(logDir, "combined.log") }), 
    ],
    defaultMeta: { module: moduleName },
  });
};

export const productLogger = createModuleLogger("product");
export const vendorLogger = createModuleLogger("vendor");
export const poLogger = createModuleLogger("po");
export const grnLogger = createModuleLogger("grn");
export const piLogger = createModuleLogger("pi");
export const saleLogger = createModuleLogger("sale");
export const indentLogger = createModuleLogger("indent");
export const purchaseindentLogger = createModuleLogger("purchase-indent");
export const appLogger = createModuleLogger("app");

