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
      return await prisma.purchaseOrderProduct.updateMany({
        where: { purchase_order_id:order_id , deleted_at: null },
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
        select:{
          order_number:true,
          vendor:{
            select:{
              name:true,
            }
          },
          order_date:true,
          total_amount:true,
          total_order_qty:true,
          status:true,
          created_at:true,
          products:{
            select:{
              product:{
                select:{
                  name:true,
                  category:true,
                  combination:true,
                  gst_percentage:true
                }
              },
              ordered_qty:true,
              total_amount:true,
              net_cost_per_qty:true
            }
          }
        }
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
      poLogger.error(`Error finding PO (order_id: ${order_id}) | ${error.message}`);
      throw error;
    }
  }

  async findPOByOrderVendorId({vendor_id = null, select = null, include = null}) {
    try {
      return await prisma.purchaseOrder.findFirst({
        where: { vendor_id, deleted_at: null },
        ...(select ? { select } : {}),
        ...(include ? { include } : {}),
      });
    } catch (error) {
      poLogger.error(`Error finding PO (order_id: ${order_id}) | ${error.message}`);
      throw error;
    }
  }

  async updatePurchaseOrderByVendorId({vendor_id,status,data}){
    console.log(vendor_id,status,data);
    
    try {
      await prisma.purchaseOrder.updateMany({
        where:{vendor_id,status},
        data
      })
    } catch (error) {
      poLogger.error(`Error finding PO (order_id: ${vendor_id}) | ${error.message}`);
      throw error;
    }
  }
}