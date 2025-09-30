import { prisma } from "../utilities/import.config.js";
import { purchaseindentLogger } from "../utilities/logger.js";

export class PurchaseIndentRepository{
      async getPurchaseIndentById({ id = null, select = null, include = null }) {
        try {
          if (id) {
            return await prisma.purchaseIndent.findUnique({
              where: { id: parseInt(id) },
              ...(select ? { select } : {}),
              ...(include ? { include } : {}),
            });
          }
    
    
          throw new Error("Either 'id' or 'ids' must be provided");
        } catch (error) {
          purchaseindentLogger.error(`Error fetching products | ${error.message}`);
          throw error;
        }
      }
    
}