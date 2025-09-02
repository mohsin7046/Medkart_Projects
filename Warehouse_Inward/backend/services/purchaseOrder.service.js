import { prisma } from '../utilities/import.config.js'
import { v4 as uuidv4 } from 'uuid'
import { STATUS,PREFIX } from '../utilities/constant.js'


export const createPurchaseOrderService = async (data) => {
  const { vendor_id, order_date, expected_delivery_date, total_amount, items } = data


  const order_number = PREFIX.ORDER + uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase()

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
          totalAmount: item.totalAmount,
        })),
      },
    },
  })
}


export const getAllPurchaseOrdersService = async () => {
  const getPO =  await prisma.purchaseOrder.findMany({
    orderBy: { createdAt: 'desc' },
    include: { purchaseOrderItems: true },
  }) 

  return getPO
}


export const deletePurchaseOrderService = async (purchase_order_id) => {
  const existingPO = await prisma.goodReceiptNote.findFirst({
    where: { order_id: purchase_order_id },
  })

  if (existingPO && existingPO.status === STATUS.COMPLETED) {
    throw new Error('Cannot delete purchase order with completed GRN')
  }

  await prisma.purchaseOrderItem.updateMany({
    where: { order_id: purchase_order_id },
    data:{
      deletedAt:Date.now()
    }
  })

  const deletePO =  await prisma.purchaseOrder.update({
    where: { id: purchase_order_id },
     data:{
      deletedAt:Date.now()
    }
  })

  if(!deletePO){
    throw new Error("Purchase Order not deleted")
  }

  return deletePO;
}


export const updatePurchaseOrderService = async (formData) => {
  const updatedPO =  await prisma.purchaseOrder.update({
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
          totalAmount: parseInt(item.totalAmount),
        })),
      },
    },
    include: { purchaseOrderItems: true },
  })

  return updatedPO;
}
