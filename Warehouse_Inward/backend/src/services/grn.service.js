import { prisma } from '../utilities/import.config.js'
import { STATUS } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'

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
    const items = data.items
    const purchase_order_id = data.purchase_order_id
    let statusUpdate = ''

    const receivedItemMap = items.reduce((map, item) => {
      map[item.product_id] = item
      return map
    }, {})

    for (const poItem of existingPO.purchaseOrderItems) {
      const receivedItem = receivedItemMap[poItem.id]
      if (!receivedItem) {
        throw new Error(
          `Received item with product code ${poItem.product_code} not found in PO items`
        )
      }

      const shortage_qty = receivedItem.shortage_qty || 0

      if (receivedItem.recevied_qty > poItem.quantity || shortage_qty < 0) {
        statusUpdate = STATUS.CANCELLED
        break
      } else if (
        receivedItem.recevied_qty < poItem.quantity ||
        shortage_qty > 0
      ) {
        statusUpdate = STATUS.PARTIAL_RECEVIED
      }

      const lastGRNItem = await tx.goodReceiptNoteItem.findFirst({
        where: { product_id: poItem.id, deleted_at: null },
        orderBy: { id: 'desc' }
      })

      if (lastGRNItem) {
        const allowedMRP = lastGRNItem.item_mrp * 1.2
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

    const grn_number = generateRandom('GRN')

    const newGRN = await tx.goodReceiptNote.create({
      data: {
        grn_number,
        order_id: purchase_order_id,
        received_date: new Date(data.received_date),
        damaged_qty: data.damaged_qty || 0,
        shortage_qty: data.shortage_qty || 0,
        goodReceiptNoteItems: {
          create: items.map((item) => ({
            product_id: item.product_id,
            batch_number: item.batch_number,
            expiry_date: new Date(item.expiry_date),
            recevied_qty: item.recevied_qty,
            item_price: item.item_price,
            ordered_qty: item.ordered_qty,
            item_mrp: item.item_mrp,
            totalAmount: item.totalAmount
          }))
        },
        total_amount: data.total_amount,
        status: statusUpdate
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
    const items = data.items
    const purchase_order_id = data.purchase_order_id
    const grn_id = data.id

    const existingPO = await tx.purchaseOrder.findFirst({
      where: { id: purchase_order_id, deleted_at: null },
      include: { purchaseOrderItems: true }
    })

    if (!existingPO) {
      throw new Error('Purchase order not found')
    }

    let statusUpdate = ''

    const receivedItemMap = items.reduce((map, item) => {
      map[item.product_id] = item
      return map
    }, {})

    for (const poItem of existingPO.purchaseOrderItems) {
      const receivedItem = receivedItemMap[poItem.id]
      if (!receivedItem) {
        throw new Error(
          `Received item with product code ${poItem.product_code} not found in PO items`
        )
      }

      const shortage_qty = receivedItem.shortage_qty || 0

      if (receivedItem.recevied_qty > poItem.quantity || shortage_qty < 0) {
        statusUpdate = STATUS.CANCELLED
        break
      } else if (
        receivedItem.recevied_qty < poItem.quantity ||
        shortage_qty > 0
      ) {
        statusUpdate = STATUS.PARTIAL_RECEVIED
      }

      const lastGRNItem = await tx.goodReceiptNoteItem.findFirst({
        where: { product_id: poItem.id, deleted_at: null },
        orderBy: { id: 'desc' }
      })

      if (lastGRNItem) {
        const allowedMRP = lastGRNItem.item_mrp * 1.2
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

      await tx.goodReceiptNote.update({
        where: { id: grn_id },
        data: { status: STATUS.CANCELLED }
      })

      throw new Error('Received quantity or MRP is not valid')
    }

    if (statusUpdate === '' || statusUpdate !== STATUS.PARTIAL_RECEVIED) {
      statusUpdate = STATUS.COMPLETED
    }

    const updatedGRN = await tx.goodReceiptNote.update({
      where: { id: grn_id },
      data: {
        order_id: purchase_order_id,
        received_date: new Date(data.received_date),
        damaged_qty: data.damaged_qty || 0,
        shortage_qty: data.shortage_qty || 0,
        total_amount: data.total_amount,
        status: statusUpdate
      }
    })

    await tx.purchaseOrder.update({
      where: { id: purchase_order_id },
      data: { status: statusUpdate }
    })

    return updatedGRN
  })
}

export const getALLGRNService = async (page, limit, orderBy) => {
  const skip = (page - 1) * limit

  const totalItems = await prisma.product.count({
    where: { deleted_at: null }
  })
  const allGRNs = await prisma.product.findMany({
    where: { deleted_at: null },
    include: { goodReceiptNoteItems: true },
    skip,
    take: limit,
    orderBy: { createdAt: orderBy }
  })

  const totalPages = Math.ceil(totalItems / limit)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  return {
    allGRNs,
    metadata: { page, limit, totalPages, totalItems, hasNextPage, hasPrevPage }
  }
}

export const deleteGRNRecord = async (grn_number) => {
  const deleteGRN = await prisma.goodReceiptNote.update({
    where: { grn_number },
    data: {
      deleted_at: new Date()
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

