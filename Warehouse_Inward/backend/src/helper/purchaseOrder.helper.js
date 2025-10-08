import { STATUS,PREFIX } from '../utilities/constant.js';
import { generateRandom } from '../utilities/generateRandom.js'
import { prisma } from '../utilities/import.config.js'

export const fetchPendingPurchaseIndents = async (vendorId) => {
    //ADD REPO
  return await prisma.purchaseIndent.findMany({
    where: {
      status: STATUS.PENDING,
      vendor_id: vendorId
    },
    include: { items: true }
  })
}


export const buildIncomingProductsMap = (items) => {
  const incomingProductsMap = new Map()
  items.forEach((item) => {
    incomingProductsMap.set(item.product_id, item.ordered_qty)
  })
  return incomingProductsMap
}


export const getMatchedItems = (pendingPurchaseIndents, incomingProductsMap) => {
  return pendingPurchaseIndents.flatMap((indent) =>
    indent.items.filter((item) => incomingProductsMap.has(item.product_id))
  )
}


export const calculateItemQuantities = (item, orderedQty) => {
  const currentOrderQty = item.order_qty || 0
  const qtyToBeOrder = item.qty_to_be_order
  const remainingQty = orderedQty - qtyToBeOrder
  const newOrderQty = Math.min(currentOrderQty + orderedQty, qtyToBeOrder)
  let excessQty = 0
  
  if (remainingQty > 0) {
    excessQty = remainingQty
  }

  return { newOrderQty, excessQty, remainingQty }
}


export const processMatchedItems = (matchedItems, incomingProductsMap, excessQuantityMap, updates) => {
  matchedItems.forEach((item) => {
    const orderedQty = incomingProductsMap.get(item.product_id)

    const { newOrderQty, excessQty, remainingQty } = calculateItemQuantities(item, orderedQty)

    if (excessQty > 0 && remainingQty > 0) {
      const currentExcess = excessQuantityMap.get(item.product_id) || 0
      excessQuantityMap.set(item.product_id, currentExcess + excessQty)
    }

    updates.push(
      prisma.purchaseIndentItem.update({
        where: { id: item.id },
        data: { order_qty: newOrderQty }
      })
    )
  })
}


export const processUnmatchedItems = (dataItems, matchedItems, excessQuantityMap) => {
  const matchedProductIds = new Set(matchedItems.map(item => item.product_id))

  dataItems.forEach((item) => {
    if (!matchedProductIds.has(item.product_id)) {
      const currentExcess = excessQuantityMap.get(item.product_id) || 0
      excessQuantityMap.set(item.product_id, currentExcess + item.ordered_qty)
    }
  })
}

export const createInventoryUpdateOperations = (excessQuantityMap, updates) => {

  excessQuantityMap.forEach((excessQty, productId) => {
    updates.push(
      prisma.product.update({
        where: { id: productId },
        data: {
          inventory_qty: {
            increment: excessQty
          }
        }
      })
    )
  })

  console.log('Excess Quantities:', excessQuantityMap)
}


export const buildIndentItemsMap = (matchedItems) => {
  const indentItemsMap = new Map()

  matchedItems.forEach((item) => {
    if (!indentItemsMap.has(item.purchase_indent_id)) {
      indentItemsMap.set(item.purchase_indent_id, [])
    }
    indentItemsMap.get(item.purchase_indent_id).push(item)
  })

  return indentItemsMap
}


export const calculateIndentTotalOrderedQty = (items, incomingProductsMap, indent) => {
  let totalOrderedQty = indent.total_order_qty || 0

  items.forEach((item) => {
    const orderedQty = incomingProductsMap.get(item.product_id)
    const currentOrderQty = item.order_qty || 0
    const qtyToBeOrder = item.qty_to_be_order
    const remainingQty = qtyToBeOrder - currentOrderQty
    const allocatedQty = Math.min(orderedQty, remainingQty)

    totalOrderedQty += allocatedQty
  })

  return totalOrderedQty
}


export const createIndentUpdateOperations = (indentItemsMap, pendingPurchaseIndents, incomingProductsMap, updates) => {

  for (const [indentId, items] of indentItemsMap.entries()) {
    const indent = pendingPurchaseIndents.find(pi => pi.id === indentId)

    console.log('Indent Items:', items)

    const totalOrderedQty = calculateIndentTotalOrderedQty(items, incomingProductsMap, indent)

    const totalQtyToBeOrder = indent.total_qty_to_be_order
    const finalTotalOrderQty = Math.min(totalQtyToBeOrder, totalOrderedQty)

    updates.push(
      prisma.purchaseIndent.update({
        where: { id: indentId },
        data: {
          total_order_qty: finalTotalOrderQty,
          status: finalTotalOrderQty == totalQtyToBeOrder ? STATUS.COMPLETED : STATUS.PENDING
        }
      })
    )
  }
}


export const calculateTotalAmount = (items) => {
  return items.reduce((sum, item) => {
    const itemTotal = item.ordered_qty * item.net_cost_per_qty
    return sum + itemTotal
  }, 0)
}


export const calculateTotalOrderQty = (items) => {
  return items.reduce((sum, item) => sum + item.ordered_qty, 0)
}



export const createPurchaseOrderData = (data, pendingPurchaseIndents) => {

  return {
    order_number: generateRandom(PREFIX.ORDER),
    vendor_id: data.vendor_id,
    purchase_indent_id: pendingPurchaseIndents[0]?.id || null,
    order_date: new Date(),
    total_amount: calculateTotalAmount(data.items),
    total_order_qty: calculateTotalOrderQty(data.items),
    status: STATUS.SENT,
    products: {
      create: data.items.map((item) => ({
        product_id: item.product_id,
        ordered_qty: item.ordered_qty,
        total_amount: item.ordered_qty * item.net_cost_per_qty,
        net_cost_per_qty: item.net_cost_per_qty
      }))
    }
  }
}



export const createPurchaseOrderOperation = (purchaseOrderData, updates) => {
  updates.push(
    prisma.purchaseOrder.create({
      data: purchaseOrderData,
      include: { products: true }
    })
  )
}


export const executeTransactionAndGetResult = async (updates) => {
  const result = await prisma.$transaction(updates)
  const createdPurchaseOrder = result[result.length - 1]
  return createdPurchaseOrder
}



export const createSuccessResponse = (createdPurchaseOrder, excessQuantityMap) => {
  return {
    success: true,
    purchaseOrder: createdPurchaseOrder,
    excessQuantities: Object.fromEntries(excessQuantityMap),
    message: 'Purchase Order created and Purchase Indents updated successfully'
  }
}