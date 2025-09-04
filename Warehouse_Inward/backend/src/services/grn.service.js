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
    let statusUpdate = ''

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
        statusUpdate = STATUS.CANCELLED
        break
      } else if (
        receivedItem.recevied_qty < receivedItem.ordered_qty &&
        shortage_qty > 0
      ) {
        statusUpdate = STATUS.PARTIAL_RECEVIED
      }

      const lastProductIteMRP = await tx.product.findFirst({
        where: { id: poItem.product_id, deleted_at: null },
        select:{last_purchase_price:true}
      })

      if (lastProductIteMRP) {
        const allowedMRP = lastProductIteMRP * 1.2
        if (receivedItem.item_mrp > allowedMRP) {
          statusUpdate = STATUS.CANCELLED
          break
        }
      }
    }

    if (statusUpdate === STATUS.CANCELLED) {
      await tx.purchaseOrder.update({
        where: { id: purchase_order_id },
        data: { status: STATUS.CANCELLED }
      })
      throw new Error('Received quantity or MRP is not valid')
    }

    if (statusUpdate === '' || statusUpdate !== STATUS.PARTIAL_RECEVIED) {
      statusUpdate = STATUS.COMPLETED
    }

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

    const newGRN = await tx.goodReceiptNote.create({
      data: {
        grn_number,
        order_id: purchase_order_id,
        received_date: new Date(data.received_date),
        damaged_qty: data.damaged_qty || 0,
        shortage_qty: data.shortage_qty || 0,
        goodReceiptNoteItems: {
          create: data.items.map((item, idx) => ({
            product_id: item.product_id,
            batch_number: item.batch_number,
            expiry_date: new Date(item.expiry_date),
            recevied_qty: item.recevied_qty,
            item_price: item.item_price,
            ordered_qty: item.ordered_qty,
            item_mrp: item.item_mrp,
            totalAmount: itemsWithTotal[idx].totalAmount
          }))
        },
        total_amount,
        status: statusUpdate === STATUS.COMPLETED ? STATUS.PENDING : statusUpdate
      }
    })

    await tx.purchaseOrder.update({
      where: { id: purchase_order_id },
      data: { status: statusUpdate }
    })

    return newGRN
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

    console.log(existingPO);


    let statusUpdate = ''

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
        statusUpdate = STATUS.CANCELLED
        break
      } else if (
        receivedItem.recevied_qty < receivedItem.ordered_qty &&
        shortage_qty > 0
      ) {
        statusUpdate = STATUS.PARTIAL_RECEVIED
      }

      // const lastGRNItem = await tx.goodReceiptNoteItem.findFirst({
      //   where: { product_id: poItem.product_id, deleted_at: null },
      //   orderBy: { id: 'desc' }
      // })

      // console.log(lastGRNItem);


      //   if (lastGRNItem) {
      //     const allowedMRP = lastGRNItem.item_mrp * 1.2
      //     if (Number(receivedItem.item_mrp) > allowedMRP) {
      //       statusUpdate = STATUS.CANCELLED
      //       break
      //     }
      //   }
    }

    if (statusUpdate === STATUS.CANCELLED) {
      await tx.purchaseOrder.update({
        where: { id: purchase_order_id },
        data: { status: STATUS.CANCELLED }
      })

      await tx.goodReceiptNote.update({
        where: { id: grn_id },
        data: { status: STATUS.CANCELLED }
      })

      throw new Error('Received quantity or MRP is not valid')
    }

    if (statusUpdate === '' || statusUpdate !== STATUS.PARTIAL_RECEVIED) {
      statusUpdate = STATUS.PENDING
    }

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

    const updatedGRN = await tx.goodReceiptNote.update({
      where: { id: grn_id },
      data: {
        received_date: new Date(data.received_date),
        damaged_qty: data.damaged_qty || 0,
        shortage_qty: data.shortage_qty || 0,
        total_amount,
        status: statusUpdate,
        goodReceiptNoteItems: {
          deleteMany: { grn_id: grn_id },
          create: data.items.map((item, idx) => ({
            product_id: item.product_id,
            batch_number: item.batch_number,
            expiry_date: new Date(item.expiry_date),
            recevied_qty: item.recevied_qty,
            item_price: item.item_price,
            ordered_qty: item.ordered_qty,
            item_mrp: item.item_mrp,
            totalAmount: itemsWithTotal[idx].totalAmount
          }))
        },
      }
    })

    await tx.purchaseOrder.update({
      where: { id: purchase_order_id },
      data: { status: statusUpdate }
    })

    return updatedGRN
  })
}



export const deleteGRNRecord = async (grn_id) => {
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

export const getGRNByIdService = async(id)=>{
   const data = await prisma.goodReceiptNote.findUnique({
    where:{id:parseInt(id)},
    include:{goodReceiptNoteItems:true}
  });
  console.log(data);
  return data;
}

