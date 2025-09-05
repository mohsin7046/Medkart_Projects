import { prisma } from '../utilities/import.config.js'
import { STATUS } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'
import { decimalConversion } from '../utilities/decimal.conversion.js'

export const findPOByOrderNumber = async (order_id) => {
  const POOrderNumber = await prisma.purchaseOrder.findFirst({
    where: { id: order_id, deleted_at: null },
    include: { purchaseOrderItems: true }
  })
  return POOrderNumber
}

export const findGRNByNumber = async (grn_id) => {
  const grnfind = await prisma.goodReceiptNote.findFirst({
    where: { id: grn_id, deleted_at: null },
    include: { goodReceiptNoteItems: true }
  })
  return grnfind
}


export const createGRNRecord = async (existingPO, data) => {

  return await prisma.$transaction(async (tx) => {

    const purchase_order_id = data.order_id
    let statusUpdatePO = ''
    let statusUpdateGRN = ''

    const receivedItemMap = data.items.reduce((map, item) => {
      map[item.product_id] = item
      return map
    }, {})

    for (const poItem of existingPO.purchaseOrderItems) {
      const receivedItem = receivedItemMap[poItem.product_id]

      if (!receivedItem) {
        throw new Error(
          `Received item with product code ${poItem.product_id} not found in PO items`
        )
      }

      const shortage_qty = receivedItem.shortage_qty || 0

      if (receivedItem.recevied_qty > receivedItem.ordered_qty && shortage_qty < 0) {
        statusUpdatePO = STATUS.CANCELLED
        statusUpdatePO = STATUS.CANCELLED
        break
      } else if (
        receivedItem.recevied_qty < receivedItem.ordered_qty &&
        shortage_qty > 0
      ) {
        statusUpdatePO = STATUS.PARTIAL_RECEVIED
      }

      const lastProductIteMRP = await tx.product.findFirst({
        where: { id: poItem.product_id, deleted_at: null },
        select: { last_purchase_price: true }
      })

      if (lastProductIteMRP) {
        const allowedMRP = lastProductIteMRP * 1.2
        if (receivedItem.item_mrp > allowedMRP) {
          statusUpdatePO = STATUS.CANCELLED
          statusUpdatePO = STATUS.CANCELLED
          break
        }
      }
    }

    if (statusUpdatePO === STATUS.CANCELLED) {
      const deletePO = await tx.purchaseOrder.update({
        where: { id: purchase_order_id },
        data: { status: STATUS.CANCELLED }
      })
     return deletePO
    }

    if (statusUpdatePO === '' || statusUpdatePO !== STATUS.PARTIAL_RECEVIED) {
      statusUpdatePO = STATUS.COMPLETED
    }

    let newGRN;

    if(statusUpdateGRN !== STATUS.CANCELLED){
    const grn_number = generateRandom('GRN');

    const itemsWithTotal = data.items.map((item) => {
      const totalAmount = decimalConversion(item.recevied_qty * item.item_price);
      return {
        ...item,
        totalAmount,
      };
    });

    const total_amount = decimalConversion(itemsWithTotal.reduce(
      (sum, item) => sum + item.totalAmount,
      0
    ));

     newGRN = await tx.goodReceiptNote.create({
      data: {
        grn_number,
        order_id: purchase_order_id,
        received_date: new Date(data.received_date),
        goodReceiptNoteItems: {
          create: data.items.map((item, idx) => ({
            product_id: item.product_id,
            batch_number: item.batch_number,
            expiry_date: new Date(item.expiry_date),
            recevied_qty: item.recevied_qty,
            item_price: item.item_price,
            ordered_qty: item.ordered_qty,
            damaged_qty: item.damaged_qty ,
            shortage_qty: item.shortage_qty,
            item_mrp: item.item_mrp,
            totalAmount: itemsWithTotal[idx].totalAmount
          }))
        },
        total_amount,
        status: STATUS.PENDING
      }
    })

    await tx.purchaseOrder.update({
      where: { id: purchase_order_id },
      data: { status: statusUpdatePO }
    })
  }

    return newGRN;
  })
}


export const updateGRNRecord = async (existingGRN, data) => {
  
  if ([STATUS.COMPLETED, STATUS.CANCELLED].includes(existingGRN.status)) {
    throw new Error('Cannot update a completed or cancelled GRN')
  }

  return await prisma.$transaction(async (tx) => {
    const purchase_order_id = data.order_id
    const grn_id = data.grn_id

    const existingPO = await findPOByOrderNumber(data.order_id)

    if (!existingPO) {
      throw new Error('Purchase order not found')
    }

    let statusUpdatePO = ''
    let statusUpdateGRN = '';

    const receivedItemMap = data.items.reduce((map, item) => {
      map[item.product_id] = item
      return map
    }, {})

    for (const poItem of existingPO.purchaseOrderItems) {
      const receivedItem = receivedItemMap[poItem.product_id]
      if (!receivedItem) {
        throw new Error(
          `Received item with product code ${poItem.product_id} not found in PO items`
        )
      }

      const shortage_qty = receivedItem.shortage_qty || 0

      if (receivedItem.recevied_qty > receivedItem.ordered_qty && shortage_qty < 0) {
        statusUpdatePO = STATUS.CANCELLED
        statusUpdateGRN = STATUS.CANCELLED
        break
      } else if (
        receivedItem.recevied_qty < receivedItem.ordered_qty &&
        shortage_qty > 0
      ) {
        statusUpdatePO = STATUS.PARTIAL_RECEVIED
      }

      const lastProductIteMRP = await tx.product.findFirst({
        where: { id: poItem.product_id, deleted_at: null },
        select: { last_purchase_price: true }
      })

      if (lastProductIteMRP) {
        const allowedMRP = lastProductIteMRP * 1.2
        if (receivedItem.item_mrp > allowedMRP) {
          statusUpdatePO = STATUS.CANCELLED
          statusUpdateGRN = STATUS.CANCELLED
          break
        }
      }
    }

    if (statusUpdatePO === STATUS.CANCELLED && statusUpdateGRN === STATUS.CANCELLED) {
      await tx.purchaseOrder.update({
        where: { id: purchase_order_id },
        data: { status: STATUS.CANCELLED }
      })

      const deleteGRN = await tx.goodReceiptNote.update({
        where: { id: grn_id },
        data: { status: STATUS.CANCELLED}
      })

      return deleteGRN
    }

    if (statusUpdatePO === '' || statusUpdatePO !== STATUS.PARTIAL_RECEVIED) {
      statusUpdatePO = STATUS.COMPLETED
    }

    if(statusUpdateGRN === '' || statusUpdateGRN !== STATUS.CANCELLED){
      statusUpdateGRN = STATUS.PENDING
    }
    let updatedGRN;
    if(statusUpdateGRN !== STATUS.CANCELLED){
    const itemsWithTotal = data.items.map((item) => {
      const totalAmount = decimalConversion(item.recevied_qty * item.item_price);
      return {
        ...item,
        totalAmount,
      };
    });

    const total_amount = decimalConversion(itemsWithTotal.reduce(
      (sum, item) => sum + item.totalAmount,
      0
    ));

     updatedGRN = await tx.goodReceiptNote.update({
      where: { id: grn_id },
      data: {
        received_date: new Date(data.received_date),
        total_amount,
        status: statusUpdateGRN,
        goodReceiptNoteItems: {
          deleteMany: { grn_id: grn_id },
          create: data.items.map((item, idx) => ({
            product_id: item.product_id,
            batch_number: item.batch_number,
            expiry_date: new Date(item.expiry_date),
            recevied_qty: item.recevied_qty,
            item_price: item.item_price,
            ordered_qty: item.ordered_qty,
            damaged_qty: item.damaged_qty ,
            shortage_qty: item.shortage_qty,
            item_mrp: item.item_mrp,
            totalAmount: itemsWithTotal[idx].totalAmount
          }))
        },
      }
    })

    await tx.purchaseOrder.update({
      where: { id: purchase_order_id },
      data: { status: statusUpdatePO }
    })
  }

    return updatedGRN
  })
}



export const deleteGRNRecord = async (grn_id) => {
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
      purchaseOrder:{select:{
        order_number:true,
      }
    },
      goodReceiptNoteItems: true }
  });
  console.log(data);
  return data;
}

