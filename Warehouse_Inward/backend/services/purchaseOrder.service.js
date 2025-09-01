import { prisma } from '../utilities/import.config.js'
import { v4 as uuidv4 } from 'uuid'


export const createPurchaseOrderService = async (data) => {
  const { vendor_code, order_date, expected_delivery_date, total_amount, items } = data


  const order_number = 'ORD-' + uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase()

  return await prisma.purchaseOrder.create({
    data: {
      vendor_code,
      order_date: new Date(order_date),
      order_number,
      expected_delivery_date: new Date(expected_delivery_date),
      total_amount,
      status: 'pending',
      purchaseOrderItems: {
        create: items.map((item) => ({
          product_code: item.product_code,
          quantity: parseInt(item.quantity),
          item_price: parseInt(item.item_price),
          item_mrp: parseInt(item.item_mrp),
          totalAmount: parseInt(item.totalAmount),
        })),
      },
    },
  })
}


export const getAllPurchaseOrdersService = async () => {
  return await prisma.purchaseOrder.findMany({
    orderBy: { createdAt: 'desc' },
    include: { purchaseOrderItems: true },
  })
}


export const deletePurchaseOrderService = async (purchase_order_number) => {
  const existingPO = await prisma.goodReceiptNote.findFirst({
    where: { order_number: purchase_order_number },
  })

  if (existingPO && existingPO.status === 'completed') {
    throw new Error('Cannot delete purchase order with completed GRN')
  }

  await prisma.purchaseOrderItem.deleteMany({
    where: { order_number: purchase_order_number },
  })

  return await prisma.purchaseOrder.delete({
    where: { order_number: purchase_order_number },
  })
}


export const updatePurchaseOrderService = async (formData) => {
  return await prisma.purchaseOrder.update({
    where: { order_number: formData.order_number },
    data: {
      vendor_code: formData.vendor_code,
      order_date: new Date(formData.order_date),
      expected_delivery_date: new Date(formData.expected_delivery_date),
      total_amount: formData.total_amount,
      purchaseOrderItems: {
        deleteMany: { order_number: formData.order_number },
        create: formData.items.map((item) => ({
          product_code: item.product_code,
          quantity: parseInt(item.quantity),
          item_price: parseInt(item.item_price),
          item_mrp: parseInt(item.item_mrp),
          totalAmount: parseInt(item.totalAmount),
        })),
      },
    },
    include: { purchaseOrderItems: true },
  })
}
