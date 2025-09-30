import { STATUS, PREFIX } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'
import { decimalConversion } from '../utilities/decimal.conversion.js'
import { poLogger } from '../utilities/logger.js'
import { purchaseOrderQueue, purchaseOrderQueueEvents } from '../cache/queueManager.js'
import { PurchaseOrderRepository } from '../repository/purchaseOrder.repository.js'
import { prisma } from '../utilities/import.config.js'

const PurchaseOrderRepo = new PurchaseOrderRepository();

export const createPurchaseOrderAgainstPurchaseIndentService = async ({purchase_indent_ids}) => {
  try {
    console.log(purchase_indent_ids);
  
    const pendingIndents = await prisma.purchaseIndent.findMany({
      where: { 
        status: STATUS.PENDING, 
        id: { in: purchase_indent_ids }
      },
      select: {
        id: true,
        product_id: true,
        vendor_id: true,
        sale_ident_ids: true,
        total_order_qty: true,
        total_amount: true
      }
    });

    console.log(pendingIndents);
    
    if (!pendingIndents.length) {
      console.log("No pending PurchaseIndents to convert.");
      return { success: true, message: "No pending indents found", count: 0 };
    }

    const vendorGroups = pendingIndents.reduce((acc, indent) => {
      if (!acc.has(indent.vendor_id)) {
        acc.set(indent.vendor_id, {
          purchase_indent_ids: [],
          total_amount: 0,
          total_order_qty: 0,
          products: []
        });
      }
      
      const group = acc.get(indent.vendor_id);
      group.purchase_indent_ids.push(indent.id);
      group.total_amount += indent.total_amount;
      group.total_order_qty += indent.total_order_qty;
      group.products.push({
        id: indent.id,
        product_id: indent.product_id,
        ordered_qty: indent.total_order_qty,
        amount: indent.total_amount
      });
      
      return acc;
    }, new Map());

    console.log("VendorGroups", vendorGroups);


    const result = await prisma.$transaction(async (tx) => {
      const createdOrders = [];

      
      for (const [vendorId, group] of vendorGroups.entries()) {
      
        const purchaseOrder = await tx.purchaseOrder.create({
          data: {
            order_number: generateRandom(PREFIX.ORDER),
            vendor_id: vendorId,
            order_date: new Date(),
            total_order_qty: group.total_order_qty,
            total_amount: group.total_amount,
            status: STATUS.PENDING,
          },
        });

        createdOrders.push(purchaseOrder);

        await tx.purchaseOrderProduct.createMany({
          data: group.products.map(indent => ({
            purchase_order_id: purchaseOrder.id,
            product_id: indent.product_id,
            ordered_qty: indent.ordered_qty,
            total_amount: indent.amount,
          }))
        });

        await tx.purchaseIndent.updateMany({
          where: { 
            id: { in: group.purchase_indent_ids }
          },
          data: {
            status: STATUS.ACCEPTED,
          }
        });
      }

      return createdOrders;
    });

    console.log(`✅ Created ${result.length} PurchaseOrders from ${pendingIndents.length} PurchaseIndents.`);
    
    return { 
      success: true, 
      purchaseOrders: result, 
      count: result.length 
    };

  } catch (error) {
    poLogger.error(`❌ Failed to create Purchase Order | Error: ${error.message}`);
    throw error;
  }
}



export const deletePurchaseOrderService = async (order_id) => {
  try {
    console.log(order_id);

    const existingPO = await PurchaseOrderRepo.findPOByOrderId({ id: order_id });

    if (existingPO && (existingPO.status === STATUS.COMPLETED || existingPO.status === STATUS.CANCELLED)) {
      throw new Error('Cannot delete completed or cancelled Purchase Order');
    }

    const module = 'purchaseOrder';
    const operation = 'delete';

    const job = await purchaseOrderQueue.add(`${module}:${operation}`, {
      module,
      operation,
      payload: { order_id },
    }, {
      attempts: 3,
      backoff: { type: 'fixed', delay: 2000 },
      removeOnComplete: true,
    });

    const deletePO = await job.waitUntilFinished(purchaseOrderQueueEvents);

    if (!deletePO || deletePO.status !== 'success') {
      poLogger.error(`❌ Error while deleting purchase Order  ${order_id}`);
      throw new Error("Purchase Order not deleted");
    }

    poLogger.info(`✅ Purchase Order deleted | ID: ${order_id}`);
    return deletePO;
  } catch (error) {
    poLogger.error(`❌ Failed to delete Purchase Order | ID: ${order_id} | Error: ${error.message}`);
    throw error;
  }
}


export const getPurchaseOrderByIdService = async (id) => {
  try {

    const poData = await PurchaseOrderRepo.getPurchaseOrderById(id)

    if (!poData) {
      throw new Error(`Purchase Order not found for ID: ${id}`);
    }

    poLogger.info(`✅ Purchase Order fetched | ID: ${id}`);

    return poData;
  } catch (error) {
    poLogger.error(`❌ Failed to fetch Purchase Order | ID: ${id} | Error: ${error.message}`);
    throw error;
  }
}