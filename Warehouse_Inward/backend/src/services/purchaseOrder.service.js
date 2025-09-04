import { prisma } from '../utilities/import.config.js'
import { STATUS } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'
import { decimalConversion } from '../utilities/decimal.conversion.js'


export const createPurchaseOrderService = async (data) => {
  const { vendor_id, order_date, expected_delivery_date, items } = data;

  const order_number = generateRandom("ORDER");

  const itemsWithTotal = items.map((item) => {
    const totalAmount = decimalConversion(item.quantity * item.item_price);
    return {
      ...item,
      totalAmount,
    };
  });

  const total_amount = decimalConversion(itemsWithTotal.reduce(
    (sum, item) => sum + item.totalAmount,
    0
  ));

  const createdPO = await prisma.purchaseOrder.create({
    data: {
      vendor_id,
      order_date: new Date(order_date),
      order_number,
      expected_delivery_date: new Date(expected_delivery_date),
      total_amount,
      status: STATUS.PENDING,
      purchaseOrderItems: {
        create: items.map((item, idx) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          item_price: item.item_price,
          item_mrp: item.item_mrp,
          totalAmount: itemsWithTotal[idx].totalAmount
        }))
      }
    }
  })

  return createdPO;
}




export const deletePurchaseOrderService = async (order_id) => {

  const existingPO = await prisma.purchaseOrder.findFirst({
    where: { id:order_id, deleted_at: null }
  })

  if (existingPO && (existingPO.status === STATUS.COMPLETED && existingPO.status === STATUS.CANCELLED)) {
    throw new Error('Cannot delete purchase order with completed or cancelled PurchaseOrder')
  }

  await prisma.purchaseOrderItem.updateMany({
    where: { order_id: order_id },
    data: {
      deleted_at: new Date()
    }
  })

  const deletePO = await prisma.purchaseOrder.update({
    where: { id: order_id },
    data: {
      deleted_at: new Date(),
      status: STATUS.CANCELLED
    }
  })

  if (!deletePO) {
    throw new Error('Purchase Order not deleted')
  }

  return deletePO
}


export const updatePurchaseOrderService = async (formData) => {

  const itemsWithTotal = formData.items.map((item) => {
    const totalAmount = decimalConversion(item.quantity * item.item_price);
    return {
      ...item,
      totalAmount,
    };
  });

  const total_amount = decimalConversion(itemsWithTotal.reduce(
    (sum, item) => sum + item.totalAmount,
    0
  ));

  const updatedPO = await prisma.purchaseOrder.update({
    where: { id: formData.order_id },
    data: {
      order_date: new Date(formData.order_date),
      expected_delivery_date: new Date(formData.expected_delivery_date),
      total_amount,
      purchaseOrderItems: {
        deleteMany: { order_id: formData.order_id },
        create: formData.items.map((item, idx) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          item_price: item.item_price,
          item_mrp: item.item_mrp,
          totalAmount: itemsWithTotal[idx].totalAmount
        }))
      }
    },
    include: { purchaseOrderItems: true }
  })

  return updatedPO
}

export const getPurchaseOrderByIdService = async(id)=>{
  const data = await prisma.purchaseOrder.findUnique({
    where: { id: parseInt(id) },
    include: {
      vendor: {
        select: { id: true, name: true},
      },
      purchaseOrderItems: {
        include: {
          product: {
            select: { id: true, name: true},
          },
        },
      },
    },
  });

  console.log(data);
  
  return data;
}