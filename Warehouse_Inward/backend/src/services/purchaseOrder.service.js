import { prisma } from '../utilities/import.config.js'
import { STATUS, PREFIX } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'

export const createPurchaseOrderService = async (data) => {
  const { vendor_id, order_date, expected_delivery_date, total_amount, items } =
    data

  const order_number = generateRandom("ORDER");

  return await prisma.purchaseOrder.create({
    data: {
      vendor_id,
      order_date: new Date(order_date),
      order_number,
      expected_delivery_date: new Date(expected_delivery_date),
      total_amount,
      status: STATUS.PENDING,
      purchaseOrderItems: {
        create: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          item_price: item.item_price,
          item_mrp: item.item_mrp,
          totalAmount: item.totalAmount
        }))
      }
    }
  })
}

export const getAllPurchaseOrdersService = async (page, limit, orderBy) => {
  const skip = (page - 1) * limit

  const totalItems = await prisma.product.count()
  const allProductOrders = await prisma.product.findMany({
    where: { deleted_at: null },
    skip,
    take: limit,
    include: { purchaseOrderItems: true },
    orderBy: { createdAt: orderBy }
  })

  const totalPages = Math.ceil(totalItems / limit)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  return {
    allProductOrders,
    metadata: { page, limit, totalPages, totalItems, hasNextPage, hasPrevPage }
  }
}

export const deletePurchaseOrderService = async (purchase_order_id) => {
  const existingPO = await prisma.goodReceiptNote.findFirst({
    where: { order_id: purchase_order_id, deleted_at: null }
  })

  if (existingPO && existingPO.status === STATUS.COMPLETED) {
    throw new Error('Cannot delete purchase order with completed GRN')
  }

  await prisma.purchaseOrderItem.updateMany({
    where: { order_id: purchase_order_id },
    data: {
      deleted_at: new Date()
    }
  })

  const deletePO = await prisma.purchaseOrder.update({
    where: { id: purchase_order_id },
    data: {
      deleted_at: new Date()
    }
  })

  if (!deletePO) {
    throw new Error('Purchase Order not deleted')
  }

  return deletePO
}

export const updatePurchaseOrderService = async (formData) => {
  const updatedPO = await prisma.purchaseOrder.update({
    where: { order_number: formData.order_number },
    data: {
      vendor_id: formData.vendor_id,
      order_date: new Date(formData.order_date),
      expected_delivery_date: new Date(formData.expected_delivery_date),
      total_amount: formData.total_amount,
      purchaseOrderItems: {
        deleteMany: { order_number: formData.order_number },
        create: formData.items.map((item) => ({
          product_id: item.product_id,
          quantity: parseInt(item.quantity),
          item_price: parseInt(item.item_price),
          item_mrp: parseInt(item.item_mrp),
          totalAmount: parseInt(item.totalAmount)
        }))
      }
    },
    include: { purchaseOrderItems: true }
  })

  return updatedPO
}

export const searchFilterPurchaseOrderService = (query, page, limit) =>
  searchAndFilter(prisma.purchaseOrder, query, page, limit);
