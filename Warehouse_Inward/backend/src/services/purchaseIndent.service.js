import { purchaseindentLogger } from "../utilities/logger.js";
import { PurchaseIndentRepository } from "../repository/purchaseIndent.repository.js";

const purchaseIndentRepo = new PurchaseIndentRepository()

export const getPurchaseIndentByIdService = async (id) => {
  try {
    if (!id) {
      purchaseindentLogger.error("❌ Purchase Indent ID is required");
      throw new Error("Purchase Indent ID is required");
    }

    const data = await purchaseIndentRepo.getPurchaseIndentById({
      id, select: {
        id: true,
        purchase_indent_number: true,
        vendor: {
          select: {
            name: true
          }
        },
        B2B_order_qty: true,
        B2C_order_qty: true,
        total_qty_to_be_order: true,
        total_order_qty: true,
        total_amount: true,
        status: true,
        created_at:true,
        items: {
          select: {
            qty_to_be_order: true,
            order_qty: true,
            total_amount: true,
            product: {
              select: {
                name: true,
                gst_percentage: true,
                category: true,
                combination: true
              }

            }
          }
        }
      }
    });

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