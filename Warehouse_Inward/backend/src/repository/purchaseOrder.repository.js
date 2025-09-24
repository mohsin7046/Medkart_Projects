import { prisma } from "../utilities/import.config.js";
import { STATUS } from "../utilities/constant.js";
import { poLogger } from "../utilities/logger.js";

export class PurchaseOrderRepository {

  async createPurchaseOrder(data) {
    try {
      return await prisma.purchaseOrder.create({
        data,
      });
    } catch (error) {
      poLogger.error("Error creating Purchase Order: " + error.message);
      throw error;
    }
  }

  async updatePurchaseOrder({id, data, select = null, include = null}) {
    try {
      return await prisma.purchaseOrder.update({
        where: { id },
        data,
        ...(select ? { select } : {}),
        ...(include ? { include } : {}),
      });
    } catch (error) {
      poLogger.error("Error updating Purchase Order: " + error.message);
      throw error;
    }
  }

  async deletePurchaseOrder(order_id) {
    try {
       return await prisma.purchaseOrder.update({
        where: { id: order_id },
        data: { deleted_at: new Date(), status: STATUS.CANCELLED },
      });
     
    } catch (error) {
      poLogger.error("Error deleting Purchase Order: " + error.message);
      throw error;
    }
  }

  async deletePurchaseOrderItems(order_id) {
    try {
      return await prisma.purchaseOrderItem.updateMany({
        where: { order_id , deleted_at: null },
        data: { deleted_at: new Date() },
      });
    } catch (error) {
      poLogger.error("Error deleting Purchase Order Items: " + error.message);
      throw error;
    }
  }


  async getPurchaseOrderById(id) {
    try {
      return await prisma.purchaseOrder.findUnique({
        where: { id: parseInt(id) },
        include: {
          vendor: { select: { id: true, name: true, status: true } },
          purchaseOrderItems: {
            include: { product: { select: { id: true, name: true, status: true } } },
          },
        },
      });
    } catch (error) {
      poLogger.error(`Error fetching Purchase Order by ID (${id}): ${error.message}`);
      throw error;
    }
  }

  async findPOByOrderId({id = null, select = null, include = null}) {
    try {
      return await prisma.purchaseOrder.findFirst({
        where: { id, deleted_at: null },
        ...(select ? { select } : {}),
        ...(include ? { include } : {}),
      });
    } catch (error) {
      grnLogger.error(`Error finding PO (order_id: ${order_id}) | ${error.message}`);
      throw error;
    }
  }

}