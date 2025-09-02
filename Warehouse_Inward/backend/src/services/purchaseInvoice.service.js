import { prisma } from '../utilities/import.config.js'
import { STATUS, PREFIX } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'

export const createPurchaseInvoiceService = async ({
  grn_id,
  invoice_date,
  total_amount,
  items
}) => {
  return await prisma.$transaction(async (tx) => {
    
    const existingGRN = await tx.goodReceiptNote.findUnique({
      where: { id: grn_id }
    })
    if (!existingGRN) {
      throw new Error('GRN does not exist')
    }

    if ([STATUS.COMPLETED, STATUS.CANCELLED].includes(existingGRN.status)) {
      throw new Error('Purchase Invoice already created for this GRN')
    }

    const productIds = items.map((item) => item.product_id)

    const products = await tx.product.findMany({
      where: { id: { in: productIds }, deleted_at: null },
      select: { product_code: true, gst_percentage: true }
    })

    const productMap = products.reduce((obj, p) => {
      obj[p.product_code] = p.gst_percentage || 0
      return obj
    }, {})

    let total = 0
    for (let item of items) {
      const gst = productMap[item.product_code] || 0
      const sum = item.totalAmount + (item.totalAmount * gst) / 100
      total += sum
    }

    const invoice_number = generateRandom('INVOICE')

    const invoice = await tx.purchaseInvoice.create({
      data: {
        grn_id,
        invoice_number,
        invoice_date: new Date(invoice_date),
        total_amount: total_amount || total,
        PurchaseInvoiceItem: {
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

    await tx.goodReceiptNote.update({
      where: { id: grn_id },
      data: { status: STATUS.COMPLETED }
    })

    return invoice
  })
}



export const getAllPurchaseInvoicesService = async (page, limit, orderBy) => {
  const skip = (page - 1) * limit

  const totalItems = await prisma.product.count()
  const allPurchaseInvoices = await prisma.purchaseInvoice.findMany({
    where: { deleted_at: null },
    include: { PurchaseInvoiceItem: true },
    skip,
    take: limit,
    orderBy: { createdAt: orderBy }
  })

  const totalPages = Math.ceil(totalItems / limit)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  return {
    allPurchaseInvoices,
    metadata: { page, limit, totalPages, totalItems, hasNextPage, hasPrevPage }
  }
}

export const deletePurchaseInvoiceService = async (invoice_id) => {
  await prisma.purchaseInvoiceItem.updateMany({
    where: { invoice_id },
    data: {
      deletedAt: Date.now()
    }
  })

  const deletedInvoice = await prisma.purchaseInvoice.update({
    where: { id: invoice_id },
    data: {
      deleted_at: new Date()
    }
  })

  return deletedInvoice
}

export const searchFilterPurchaseInvoiceService = (query, page, limit) =>
  searchAndFilter(prisma.purchaseInvoice, query, page, limit);
