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

  async updatePurchaseOrder(order_id, data) {
    try {
      return await prisma.purchaseOrder.update({
        where: { id: order_id },
        data,
        include: { purchaseOrderItems: true },
      });
    } catch (error) {
      poLogger.error("Error updating Purchase Order: " + error.message);
      throw error;
    }
  }

  async deletePurchaseOrder(order_id) {
    try {
      await prisma.purchaseOrderItem.updateMany({
        where: { order_id },
        data: { deleted_at: new Date() },
      });

      const deletePO = await prisma.purchaseOrder.update({
        where: { id: order_id },
        data: { deleted_at: new Date(), status: STATUS.CANCELLED },
      });

      return deletePO;
    } catch (error) {
      poLogger.error("Error deleting Purchase Order: " + error.message);
      throw error;
    }
  }

  async deletePurchaseOrderItems(order_id) {
    try {
      return await prisma.purchaseOrderItem.updateMany({
        where: { order_id },
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

  async findExistingPO(order_id) {
    try {
      return await prisma.purchaseOrder.findFirst({
        where: { id: order_id, deleted_at: null },
      });
    } catch (error) {
      poLogger.error("Error finding Purchase Order: " + error.message);
      throw error;
    }
  }

  async findPOByOrderId(order_id) {
    try {
      return await prisma.purchaseOrder.findFirst({
        where: { id: order_id, deleted_at: null },
        include: { purchaseOrderItems: true },
      });
    } catch (error) {
      grnLogger.error(`Error finding PO (order_id: ${order_id}) | ${error.message}`);
      throw error;
    }
  }

  async updatePOStatus( order_id, status) {
    try {
      return await prisma.purchaseOrder.update({
        where: { id: order_id },
        data: { status },
      });
    } catch (error) {
      grnLogger.error("Error updating Purchase Order status: " + error.message);
      throw error;
    }
  }
} 
