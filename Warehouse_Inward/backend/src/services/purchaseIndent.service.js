import { purchaseindentLogger } from "../utilities/logger.js";
import { PurchaseIndentRepository } from "../repository/purchaseIndent.repository.js";

const purchaseIndentRepo = new PurchaseIndentRepository()

export const getPurchaseIndentByIdService = async(id)=>{
    try {
        if (!id) {
          purchaseindentLogger.error("❌ Purchase Indent ID is required");
          throw new Error("Purchase Indent ID is required");
        }
    
        const data = await purchaseIndentRepo.getPurchaseIndentById({id});
    
        if (!data) {
          purchaseindentLogger.warn(`⚠️ Purchase Indent not found for id: ${id}`);
          throw new Error("Purchase Indent not found for the given id");
        }
    
        purchaseindentLogger.info(`✅ Purchase Indent fetched successfully for id: ${id}`);
    
        return data;
      } catch (error) {
        purchaseindentLogger.error(`❌ Error fetching Purchase Indent by id: ${id} | ${error.message}`);
        throw error;
      }
}