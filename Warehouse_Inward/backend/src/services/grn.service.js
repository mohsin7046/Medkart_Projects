import { prisma } from '../utilities/import.config.js'
import { SETEXPIRY, STATUS } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'
import { decimalConversion } from '../utilities/decimal.conversion.js'
import { calculateItemsTotal, determineStatus } from '../helper/grn.helper.js'
import { checkExpiry } from '../utilities/checkExpiry.js'
import { grnLogger } from '../utilities/logger.js'

export const findPOByOrderNumber = async (order_id) => {

  const POOrderNumber = await prisma.purchaseOrder.findFirst({
    where: { id: order_id, deleted_at: null },
    include: { purchaseOrderItems: true }
  })
  if (!POOrderNumber) {
    grnLogger.error(`Error Finding PO with order_id: ${order_id}`);
  }
  grnLogger.info(` PO with order_id: ${order_id} is founded`);
  return POOrderNumber
}


export const findGRNByNumber = async (grn_id) => {
  const grnfind = await prisma.goodReceiptNote.findFirst({
    where: { id: grn_id, deleted_at: null },
    include: { goodReceiptNoteItems: true }
  })
  if (!grnfind) {
    grnLogger.error(`Error Finding grn with grn_id: ${grn_id}`);
  }
  grnLogger.info(` GRN with grn_id: ${grn_id} is founded`);
  return grnfind
}



export const createGRNRecordService = async (data) => {

  if (!data.items?.length) {
    grnLogger.error("No items provided");
    throw new Error('No items provided');
  }

  data.items.forEach(item => {
    if (item.item_mrp < item.item_price){
      grnLogger.error(`MRP cannot be less than price for product ${item.product_id}`)
      throw new Error(`MRP cannot be less than price for product ${item.product_id}`)  
    };
    if (!checkExpiry(item.expiry_date)){
      grnLogger.error(`Expiry date must be at least ${SETEXPIRY.expiryMonth} months`)
      throw new Error(`Expiry date must be at least ${SETEXPIRY.expiryMonth} months`)
    };
  });

  const existingPO = await findPOByOrderNumber(data.order_id);
  if (!existingPO){ 
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
      newGRN = await tx.goodReceiptNote.create({
        data: {
          grn_number,
          order_id: data.order_id,
          received_date: new Date(data.received_date),
          goodReceiptNoteItems: { create: itemsWithTotal },
          total_amount,
          status: STATUS.PENDING
        }
      });

      await tx.purchaseOrder.update({
        where: { id: data.order_id },
        data: { status: statusPO || STATUS.COMPLETED }
      });
    }

    if (!newGRN) {
      grnLogger.error(`Failed to create a GRN`);
      throw new Error("Failed to create GRN")
    }

    grnLogger.info(`GRN created successfully with id: ${newGRN.id}`);
    return newGRN;
  })
}


export const updateGRNRecordService = async (data) => {

  console.log(data);

  const existingGRN = await findGRNByNumber(data.grn_id);
  if (!existingGRN) throw new Error('GRN not found');
  if ([STATUS.COMPLETED, STATUS.CANCELLED].includes(existingGRN.status)) throw new Error('Cannot update a completed or cancelled GRN');

  return await prisma.$transaction(async (tx) => {
    const existingPO = await findPOByOrderNumber(data.order_id);
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
      updatedGRN = await tx.goodReceiptNote.update({
        where: { id: data.grn_id },
        data: {
          received_date: new Date(data.received_date),
          total_amount,
          status: statusGRN || STATUS.PENDING,
          goodReceiptNoteItems: {
            deleteMany: { grn_id: data.grn_id },
            create: itemsWithTotal
          }
        }
      });

      await tx.purchaseOrder.update({
        where: { id: data.order_id },
        data: { status: statusPO || STATUS.COMPLETED }
      });
    }

    grnLogger.info(`GRN updated successfully with id: ${data.grn_id}`);
    return updatedGRN;
  })
}



export const deleteGRNRecordService = async (grn_id) => {
  console.log(grn_id);

  const deleteGRN = await prisma.goodReceiptNote.update({
    where: { id: grn_id },
    data: {
      deleted_at: new Date(),
      status: STATUS.CANCELLED
    }
  })
  return deleteGRN
}

export const deleteGRNItemsById = async (grn_id) => {
  const deleteAllItem = await prisma.goodReceiptNoteItem.updateMany({
    where: { grn_id },
    data: {
      deleted_at: new Date()
    }
  })
  return deleteAllItem
}

export const getGRNByIdService = async (id) => {
  const data = await prisma.goodReceiptNote.findUnique({
    where: { id: parseInt(id) },
    include: {
      purchaseOrder: {
        select: {
          order_number: true,
        }
      },
      goodReceiptNoteItems: true
    }
  });
  console.log(data);
  return data;
}

