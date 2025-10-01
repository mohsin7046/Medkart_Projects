import { STATUS, PREFIX } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'
import { decimalConversion } from '../utilities/decimal.conversion.js'
import { poLogger } from '../utilities/logger.js'
import { purchaseOrderQueue, purchaseOrderQueueEvents } from '../cache/queueManager.js'
import { PurchaseOrderRepository } from '../repository/purchaseOrder.repository.js'
import { prisma } from '../utilities/import.config.js'

const PurchaseOrderRepo = new PurchaseOrderRepository();

export const createPurchaseOrderAgainstPurchaseIndentService = async (data) => {
  try {
    console.log(data);

    const pendingPurchaseIndents = await prisma.purchaseIndent.findMany({
      where: {
        status: STATUS.PENDING,
        vendor_id: data.vendor_id
      },
      include: { items: true }
    });

    const incomingProductsMap = new Map();

    data.items.forEach((item) => {
      incomingProductsMap.set(item.product_id, item.ordered_qty);
    });

    const matchedItems = pendingPurchaseIndents.flatMap((indent) =>
      indent.items.filter((item) => incomingProductsMap.has(item.product_id))
    );


    const updates = [];
    const excessQuantityMap = new Map();

    matchedItems.forEach((item) => {
      const orderedQty = incomingProductsMap.get(item.product_id);
      const currentOrderQty = item.order_qty || 0;
      const qtyToBeOrder = item.qty_to_be_order;
      const remainingQty = orderedQty - qtyToBeOrder;
      const newOrderQty = Math.min(currentOrderQty + orderedQty, qtyToBeOrder);
      const excessQty = 0;
      if (remainingQty > 0) {
        excessQty = remainingQty;
      }

      console.log();

      if (excessQty > 0 && remainingQty > 0) {
        const currentExcess = excessQuantityMap.get(item.product_id) || 0;
        excessQuantityMap.set(item.product_id, currentExcess + excessQty);
      }

      updates.push(
        prisma.purchaseIndentItem.update({
          where: { id: item.id },
          data: { order_qty: newOrderQty }
        })
      );
    });

    console.log('Excess Quantities:', excessQuantityMap);

    const matchedProductIds = new Set(matchedItems.map(item => item.product_id));

    data.items.forEach((item) => {
      if (!matchedProductIds.has(item.product_id)) {
        const currentExcess = excessQuantityMap.get(item.product_id) || 0;
        excessQuantityMap.set(item.product_id, currentExcess + item.ordered_qty);
      }
    });

    excessQuantityMap.forEach((excessQty, productId) => {
      updates.push(
        prisma.product.update({
          where: { id: productId },
          data: {
            inventory_qty: {
              increment: excessQty
            }
          }
        })
      );
    });

    const indentItemsMap = new Map();

    matchedItems.forEach((item) => {
      if (!indentItemsMap.has(item.purchase_indent_id)) {
        indentItemsMap.set(item.purchase_indent_id, []);
      }
      indentItemsMap.get(item.purchase_indent_id).push(item);
    });

    for (const [indentId, items] of indentItemsMap.entries()) {
      const indent = pendingPurchaseIndents.find(pi => pi.id === indentId);

      console.log('Indent Items:', items);

      let totalOrderedQty = indent.total_order_qty || 0;

      items.forEach((item) => {
        const orderedQty = incomingProductsMap.get(item.product_id);
        const currentOrderQty = item.order_qty || 0;
        const qtyToBeOrder = item.qty_to_be_order;
        const remainingQty = qtyToBeOrder - currentOrderQty;
        const allocatedQty = Math.min(orderedQty, remainingQty);

        totalOrderedQty += allocatedQty;
      });

      const totalQtyToBeOrder = indent.total_qty_to_be_order;
      const finalTotalOrderQty = Math.min(totalQtyToBeOrder, totalOrderedQty);

      updates.push(
        prisma.purchaseIndent.update({
          where: { id: indentId },
          data: {
            total_order_qty: finalTotalOrderQty,
            status: finalTotalOrderQty == totalQtyToBeOrder ? STATUS.COMPLETED : STATUS.PENDING
          }
        })
      );
    }

    const purchaseOrderData = {
      order_number: generateRandom(PREFIX.ORDER),
      vendor_id: data.vendor_id,
      purchase_indent_id: pendingPurchaseIndents[0]?.id || null,
      order_date: new Date(),
      total_amount: data.items.reduce((sum, item) => {
        const itemTotal = item.ordered_qty * item.net_cost_per_qty;
        return sum + itemTotal;
      }, 0),
      total_order_qty: data.items.reduce((sum, item) => sum + item.ordered_qty, 0),
      status: STATUS.SENT,
      products: {
        create: data.items.map((item) => ({
          product_id: item.product_id,
          ordered_qty: item.ordered_qty,
          total_amount: item.ordered_qty * item.net_cost_per_qty,
          net_cost_per_qty: item.net_cost_per_qty
        }))
      }
    };

    updates.push(
      prisma.purchaseOrder.create({
        data: purchaseOrderData,
        include: { products: true }
      })
    );

    const result = await prisma.$transaction(updates);

    const createdPurchaseOrder = result[result.length - 1];

    return {
      success: true,
      purchaseOrder: createdPurchaseOrder,
      excessQuantities: Object.fromEntries(excessQuantityMap),
      message: 'Purchase Order created and Purchase Indents updated successfully'
    };

  } catch (error) {
    poLogger.error(`❌ Failed to create Purchase Order | Error: ${error.message}`);
    throw error;
  }
};



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