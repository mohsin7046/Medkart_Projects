import { STATUS, PREFIX } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'
import { poLogger } from '../utilities/logger.js'
import { purchaseOrderQueue, purchaseOrderQueueEvents } from '../cache/queueManager.js'
import { PurchaseOrderRepository } from '../repository/purchaseOrder.repository.js'
import { prisma } from '../utilities/import.config.js'
import { buildIncomingProductsMap, buildIndentItemsMap, createIndentUpdateOperations, createInventoryUpdateOperations, createPurchaseOrderData, createPurchaseOrderOperation, createSuccessResponse, executeTransactionAndGetResult, fetchPendingPurchaseIndents, getMatchedItems, processMatchedItems, processUnmatchedItems } from '../helper/purchaseOrder.helper.js'

const PurchaseOrderRepo = new PurchaseOrderRepository();


export const createPurchaseOrderAgainstPurchaseIndentService = async (data) => {
  try {
    console.log(data)

    const pendingPurchaseIndents = await fetchPendingPurchaseIndents(data.vendor_id)

    const incomingProductsMap = buildIncomingProductsMap(data.items)

    const matchedItems = getMatchedItems(pendingPurchaseIndents, incomingProductsMap)

    const updates = []
    const excessQuantityMap = new Map()

    processMatchedItems(matchedItems, incomingProductsMap, excessQuantityMap, updates)

    processUnmatchedItems(data.items, matchedItems, excessQuantityMap)

    createInventoryUpdateOperations(excessQuantityMap, updates)

    const indentItemsMap = buildIndentItemsMap(matchedItems)

    createIndentUpdateOperations(indentItemsMap, pendingPurchaseIndents, incomingProductsMap, updates)

    const purchaseOrderData = createPurchaseOrderData(data, pendingPurchaseIndents)

    createPurchaseOrderOperation(purchaseOrderData, updates)

    const createdPurchaseOrder = await executeTransactionAndGetResult(updates)

    return createSuccessResponse(createdPurchaseOrder, excessQuantityMap)

  } catch (error) {
    poLogger.error(`❌ Failed to create Purchase Order | Error: ${error.message}`)
    throw error
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