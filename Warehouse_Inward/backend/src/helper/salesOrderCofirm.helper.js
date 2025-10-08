import { prisma } from '../utilities/import.config.js'
import { STATUS } from '../utilities/constant.js';


export const fetchAndValidateSalesOrder = async (salesOrderId) => {

  const salesOrderData = await prisma.salesOrder.findUnique({
    where: { id: salesOrderId, deleted_at: null },
    include: { 
      products: {
        where: { deleted_at: null },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              inventory_qty: true
            }
          }
        }
      }
    }
  })

  if (!salesOrderData) {
    throw new Error(`Sales Order with ID ${salesOrderId} not found`)
  }

  if (salesOrderData.status !== STATUS.ALLOCATED) {
    throw new Error(
      `Cannot confirm Sales Order ${salesOrderData.sales_order_number}. ` +
      `Status must be '${STATUS.ALLOCATED}' but current status is '${salesOrderData.status}'`
    )
  }

  return salesOrderData
}


export const validateAndPrepareInventory = (products) => {
  const inventoryChecks = []
  const insufficientProducts = []

  for (const orderProduct of products) {
    const { product_id, ordered_qty, allocated_qty, remaining_qty, product } = orderProduct

    if (remaining_qty > 0) {
      insufficientProducts.push({
        product_id,
        product_name: product.name,
        ordered_qty,
        allocated_qty,
        remaining_qty,
        reason: 'Product not fully allocated'
      })
      continue
    }

    if (product.inventory_qty < allocated_qty) {
      insufficientProducts.push({
        product_id,
        product_name: product.name,
        ordered_qty,
        allocated_qty,
        available_qty: product.inventory_qty,
        shortage: allocated_qty - product.inventory_qty,
        reason: 'Insufficient inventory'
      })
    } else {
      inventoryChecks.push({
        product_id,
        product_name: product.name,
        allocated_qty,
        current_inventory: product.inventory_qty,
        new_inventory: product.inventory_qty - allocated_qty
      })
    }
  }

  return { inventoryChecks, insufficientProducts }
}



export const throwInsufficientInventoryError = (salesOrderNumber, insufficientProducts) => {
  const errorMessage = insufficientProducts.map(p => 
    `${p.product_name} (` +
    `Ordered: ${p.ordered_qty}, ` +
    `${p.available_qty !== undefined ? `Available: ${p.available_qty}, ` : ''}` + ')'
  ).join('\n')

  throw new Error(
    `Cannot confirm Sales Order ${salesOrderNumber} due to insufficient inventory:\n${errorMessage}`
  )
}


export const executeConfirmationTransaction = async (salesOrderId, inventoryChecks) => {

  return await prisma.$transaction(async (tx) => {

    for (const check of inventoryChecks) {
      await tx.product.update({
        where: { id: check.product_id },
        data: {
          inventory_qty: {
            decrement: check.allocated_qty
          }
        }
      })

      await tx.salesOrderProduct.updateMany({
        where: { sales_order_id: salesOrderId, product_id: check.product_id },
        data: {
          allocated_qty: check.allocated_qty,
          remaining_qty: 0,
        }
      })

      console.log(
        `✅ Product ${check.product_name} inventory updated: ` +
        `${check.current_inventory} → ${check.new_inventory}`
      )
    }

    const confirmedSalesOrder = await tx.salesOrder.update({
      where: { id: salesOrderId },
      data: {
        status: STATUS.CONFIRMED,
        processed: true,
        processed_date: new Date(),
      },
      include: {
        products: true
      }
    })

    console.log(
      `✅ Sales Order ${confirmedSalesOrder.sales_order_number} confirmed successfully`
    )

    return {
      success: true,
      message: `Sales Order ${confirmedSalesOrder.sales_order_number} confirmed successfully`,
      data: confirmedSalesOrder,
      inventory_updates: inventoryChecks
    }
  })
}