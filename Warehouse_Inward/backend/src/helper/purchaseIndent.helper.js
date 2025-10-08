import { STATUS,PREFIX } from '../utilities/constant.js';
import { generateRandom } from '../utilities/generateRandom.js'
import { prisma } from '../utilities/import.config.js'
import { decimalConversion } from '../utilities/decimal.conversion.js'

export const fetchOpenSalesIndents = async () => {
//ADD REPO
  return await prisma.salesIndent.findMany({
    where: {
      status: STATUS.OPEN,
      expired_at: null
    },
    include: {
      salesOrders: {
        select: {
          sales_order_id: true
        }
      }
    }
  })
}


export const extractUniqueSalesOrderIds = (salesIndents) => {
  return [
    ...new Set(
      salesIndents.flatMap(indent => 
        indent.salesOrders.map(so => so.sales_order_id)
      )
    )
  ]
}

export const fetchSalesOrderProducts = async (salesOrderIds) => {
    //ADD REPO
  return await prisma.salesOrderProduct.findMany({
    where: {
      sales_order_id: { in: salesOrderIds },
      remaining_qty: { gt: 0 }
    },
    select: {
      product_id: true,
      remaining_qty: true,
      total_amount: true,
      sales_order_id: true,
      salesOrder: {
        select: {
          order_type: true
        }
      }
    }
  })
}


export const buildProductToVendorMap = async (productIds) => {
    //ADD REPO
  const productVendorMap = await prisma.productVendorMrpPtrRatio.findMany({
    where: {
      product_id: { in: productIds },
    },
    select: {
      product_id: true,
      vendor_id: true,
    },
  })

  const productToVendor = new Map()
  for (const pv of productVendorMap) {
    productToVendor.set(pv.product_id, pv.vendor_id)
  }

  return productToVendor
}


export const initializeVendorData = (globalVendorMap, vendorId) => {
  if (!globalVendorMap.has(vendorId)) {
    globalVendorMap.set(vendorId, {
      B2B: 0,
      B2C: 0,
      total_amount: 0,
      products: new Map()
    })
  }
}


export const updateVendorOrderQuantities = (vendorData, orderType, remainingQty) => {
  if (orderType === "B2B") {
    vendorData.B2B += remainingQty
  } else if (orderType === "B2C") {
    vendorData.B2C += remainingQty
  }
}


export const updateVendorProductData = (vendorData, productId, remainingQty, totalAmount) => {
  if (!vendorData.products.has(productId)) {
    vendorData.products.set(productId, { qty: 0, amount: 0 })
  }
  
  const productData = vendorData.products.get(productId)
  productData.qty += remainingQty
  productData.amount += totalAmount
}


export const processSalesOrderProduct = (product, globalVendorMap, productToVendor) => {
  const vendorId = productToVendor.get(product.product_id)
  
  if (!vendorId) {
    console.warn(
      `⚠️ No vendor found for product_id ${product.product_id}, skipping.`
    )
    return
  }

  initializeVendorData(globalVendorMap, vendorId)
  
  const vendorData = globalVendorMap.get(vendorId)
  
  updateVendorOrderQuantities(vendorData, product.salesOrder.order_type, product.remaining_qty)
  
  vendorData.total_amount += product.total_amount
  
  updateVendorProductData(vendorData, product.product_id, product.remaining_qty, product.total_amount)
}



export const buildGlobalVendorMap = (openSalesIndents, allSalesOrderProducts, productToVendor) => {
  const globalVendorMap = new Map()

  for (const sIndent of openSalesIndents) {
    const indentSalesOrderIds = sIndent.salesOrders.map(so => so.sales_order_id)

    const salesOrderProducts = allSalesOrderProducts.filter(
      p => p.product_id === sIndent.product_id && 
           indentSalesOrderIds.includes(p.sales_order_id)
    )

    if (!salesOrderProducts.length) {
      continue
    }

    for (const product of salesOrderProducts) {
      processSalesOrderProduct(product, globalVendorMap, productToVendor)
    }
  }

  return globalVendorMap
}




export const createPurchaseIndentItems = (vendorProducts) => {
  return Array.from(vendorProducts.entries()).map(([productId, data]) => ({
    product_id: productId,
    qty_to_be_order: data.qty,
    total_amount: decimalConversion(data.amount)
  }))
}

export const createPurchaseIndentOperations = (globalVendorMap) => {
  const operations = []

  for (const [vendorId, vendorData] of globalVendorMap.entries()) {
    const purchaseIndentNumber = generateRandom(PREFIX.PURCHASE_IDENT)
    const items = createPurchaseIndentItems(vendorData.products)

    operations.push(
      prisma.purchaseIndent.create({
        data: {
          purchase_indent_number: purchaseIndentNumber,
          vendor_id: vendorId,
          B2B_order_qty: vendorData.B2B,
          B2C_order_qty: vendorData.B2C,
          total_qty_to_be_order: vendorData.B2B + vendorData.B2C,
          total_amount: decimalConversion(vendorData.total_amount),
          status: STATUS.PENDING,
          items: {
            create: items
          }
        }
      })
    )
  }

  return operations
}


export const createSalesIndentCloseOperations = (openSalesIndents) => {
  const operations = []

  for (const sIndent of openSalesIndents) {
    operations.push(
      prisma.salesIndent.update({
        where: { id: sIndent.id },
        data: { 
          status: STATUS.CLOSED, 
          expired_at: new Date() 
        }
      })
    )
  }

  return operations
}


export const executeTransactionAndLog = async (transactions, globalVendorMap, openSalesIndents) => {
  if (transactions.length === 0) {
    console.log("No purchase indents to create.")
    return
  }

  await prisma.$transaction(transactions)
  console.log(`✅ Created ${globalVendorMap.size} PurchaseIndents with items.`)
  console.log(`✅ Closed ${openSalesIndents.length} SalesIndents.`)
}