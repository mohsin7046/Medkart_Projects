import { prisma } from '../utilities/import.config.js'
import { SETEXPIRY, STATUS } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'
import { decimalConversion } from '../utilities/decimal.conversion.js'
import { calculateItemsTotal, determineStatus } from '../helper/grn.helper.js'
import { checkExpiry } from '../utilities/checkExpiry.js'
import { grnLogger } from '../utilities/logger.js'
import { cacheSet, cacheGet, cacheDelete } from '../cache/redisClient.js';
import { grnQueue, grnQueueEvents } from '../cache/queueManager.js'
import { PurchaseOrderRepository } from '../repository/purchaseOrder.repository.js'
import { GRNRepository } from '../repository/grn.repository.js'

const purchaseOrderRepo = new PurchaseOrderRepository();
const grnRepo = new GRNRepository();


export const createGRNRecordService = async (data) => {

  if (!data.items?.length) {
    grnLogger.error("No items provided");
    throw new Error('No items provided');
  }

  data.items.forEach(item => {
    if (item.item_mrp < item.item_price) {
      grnLogger.error(`MRP cannot be less than price for product ${item.product_id}`)
      throw new Error(`MRP cannot be less than price for product ${item.product_id}`)
    };
    if (!checkExpiry(item.expiry_date)) {
      grnLogger.error(`Expiry date must be at least ${SETEXPIRY.expiryMonth} months`)
      throw new Error(`Expiry date must be at least ${SETEXPIRY.expiryMonth} months`)
    };
  });

  const existingPO = await purchaseOrderRepo.findPOByOrderId({id:data.order_id,include:{purchaseOrderItems: true }});

  if (!existingPO) {
    grnLogger.error("Purchase Order not found while creating the GRN")
    throw new Error("Purchase order not found")
  };

  if ([STATUS.COMPLETED, STATUS.CANCELLED].includes(existingPO.status)) {
    grnLogger.error("GRN already created for this order");
    throw new Error("GRN already created for this order")
  }

  return await prisma.$transaction(async (tx) => {
    const receivedMap = data.items.reduce((map, item) => (map[item.product_id] = item, map), {});
    const { statusPO, statusGRN } = await determineStatus(existingPO.purchaseOrderItems, receivedMap, tx);

    if (statusPO === STATUS.CANCELLED) {
      grnLogger.error(`PO cancelled due to invalid received quantities`);
      return await tx.purchaseOrder.update({ where: { id: data.order_id }, data: { status: STATUS.CANCELLED } });
    }

    const grn_number = generateRandom('GRN');
    const itemsWithTotal = calculateItemsTotal(data.items);
    const total_amount = decimalConversion(itemsWithTotal.reduce((sum, item) => sum + item.totalAmount, 0));

    let newGRN;

    if (statusGRN !== STATUS.CANCELLED) {

      const module = 'grn';
      const operation = 'create';
      const changedData = {
        grn_number,
        order_id: data.order_id,
        received_date: new Date(data.received_date),
        goodReceiptNoteItems: itemsWithTotal,
        total_amount,
        status: STATUS.PENDING
      }

      const job = await grnQueue.add(`${module}:${operation}`, {
        module,
        operation,
        payload: { data: changedData }
      }, {
        attempts: 3,
        backoff: { type: 'fixed', delay: 2000 },
        removeOnComplete: true,
      });

      newGRN = await job.waitUntilFinished(grnQueueEvents);

      if (!newGRN || newGRN.status !== 'success') {
        grnLogger.error('❌ Failed to create GRN via queue');
        throw new Error(newGRN?.message || 'GRN creation failed');
      }

      await purchaseOrderRepo.updatePurchaseOrder({id:data.order_id, data:{status : statusPO || STATUS.COMPLETED}});
    }

    if (!newGRN) {
      grnLogger.error(`Failed to create a GRN`);
      throw new Error("Failed to create GRN")
    }

    grnLogger.info(`GRN created successfully with id: ${newGRN.data.id}`);
    return newGRN;
  })
}


export const updateGRNRecordService = async (data) => {

  const existingGRN = await grnRepo.getGRNById(data.grn_id);
  if (!existingGRN) throw new Error('GRN not found');
  if ([STATUS.COMPLETED, STATUS.CANCELLED].includes(existingGRN.status)) throw new Error('Cannot update a completed or cancelled GRN');

  return await prisma.$transaction(async (tx) => {
    const existingPO = await purchaseOrderRepo.findPOByOrderId({id:data.order_id,include:{purchaseOrderItems: true }});
    if (!existingPO) throw new Error('Purchase order not found');

    const receivedMap = data.items.reduce((map, item) => (map[item.product_id] = item, map), {});
    const { statusPO, statusGRN } = await determineStatus(existingPO.purchaseOrderItems, receivedMap, tx);

    if (statusPO === STATUS.CANCELLED && statusGRN === STATUS.CANCELLED) {
      await tx.purchaseOrder.update({ where: { id: data.order_id }, data: { status: STATUS.CANCELLED } });
      await tx.goodReceiptNote.update({ where: { id: data.grn_id }, data: { status: STATUS.CANCELLED } });
    }

    const itemsWithTotal = calculateItemsTotal(data.items);
    const total_amount = decimalConversion(itemsWithTotal.reduce((sum, item) => sum + item.totalAmount, 0));

    let updatedGRN;

    if (statusGRN !== STATUS.CANCELLED) {
      const changeddata = {
        grn_id: data.grn_id,
        received_date: new Date(data.received_date),
        total_amount,
        status: statusGRN || STATUS.PENDING,
        goodReceiptNoteItems: itemsWithTotal
      }

      const module = 'grn';
      const operation = 'update';
      const job = await grnQueue.add(`${module}:${operation}`, {
        module,
        operation,
        payload: { data: changeddata }
      }, {
        attempts: 3,
        backoff: { type: 'fixed', delay: 2000 },
        removeOnComplete: true,
      });

      updatedGRN = await job.waitUntilFinished(grnQueueEvents);

      if (!updatedGRN || updatedGRN.status !== 'success') {
        grnLogger.error('❌ Failed to create GRN via queue');
        throw new Error(updatedGRN?.message || 'GRN creation failed');
      }

      await purchaseOrderRepo.updatePurchaseOrder({id:data.order_id, data : {status:statusPO || STATUS.COMPLETED}});
    }

    grnLogger.info(`GRN updated successfully with id: ${data.grn_id}`);
    return updatedGRN;
  })
}



export const deleteGRNRecordService = async (grn_id) => {
  
   const module = 'grn';
      const operation = 'delete';
      const job = await grnQueue.add(`${module}:${operation}`, {
        module,
        operation,
        payload: { grn_id }
      }, {
        attempts: 3,
        backoff: { type: 'fixed', delay: 2000 },
        removeOnComplete: true,
      });

      const deleteGRN = await job.waitUntilFinished(grnQueueEvents);

      if (!deleteGRN || deleteGRN.status !== 'success') {
        grnLogger.error('❌ Failed to create GRN via queue');
        throw new Error(deleteGRN?.message || 'GRN creation failed');
      }

  return deleteGRN
}


export const getGRNByIdService = async (id) => {

  const data = await grnRepo.getGRNById(id);
  if (!data) throw new Error('GRN not found');
  console.log(data);
  return data;
}

