import { prisma } from '../utilities/import.config.js'

export const createPurchaseInvoiceService = async ({ grn_number, invoice_date, total_amount, items }) => {
  
  const existingGRN = await prisma.goodReceiptNote.findUnique({ where: { grn_number } })
  if (!existingGRN) {
    throw new Error('GRN is not exist')
  }

 
  if (['completed', 'cancelled'].includes(existingGRN.status)) {
    throw new Error('Purchase Invoice already created for this GRN')
  }

 
  let total = 0
  for (let item of items) {
    const product = await prisma.product.findUnique({
      where: { product_code: item.product_code },
      select: { gst_percentage: true }
    })

    const gst = product?.gst_percentage || 0
    const sum = item.totalAmount + (item.totalAmount * gst) / 100
    total += sum
  }

//optimize For above loop
//   const productCodes = items.map(item => item.product_code);

// // Fetch all products in a single query
// const products = await prisma.product.findMany({
//   where: { product_code: { in: productCodes } },
//   select: { product_code: true, gst_percentage: true }
// });

// // Convert to a map for O(1) lookup
// const productMap = products.reduce((acc, p) => {
//   acc[p.product_code] = p.gst_percentage || 0;
//   return acc;
// }, {});

// // Compute total
// let total = 0;
// for (let item of items) {
//   const gst = productMap[item.product_code] || 0;
//   const sum = item.totalAmount + (item.totalAmount * gst) / 100;
//   total += sum;
// }

  const invoice_number = `INV-${Date.now()}`


  const invoice = await prisma.purchaseInvoice.create({
    data: {
      grn_number,
      invoice_number,
      invoice_date: new Date(invoice_date),
      total_amount: total_amount || total,
      PurchaseInvoiceItem: {
        create: items.map((item) => ({
          product_code: item.product_code,
          quantity: item.quantity,
          item_price: item.item_price,
          item_mrp: item.item_mrp,
          totalAmount: item.totalAmount
        }))
      }
    }
  })


  await prisma.goodReceiptNote.update({
    where: { grn_number },
    data: { status: 'completed' }
  })

  return invoice
}

export const getAllPurchaseInvoicesService = async () => {
  return await prisma.purchaseInvoice.findMany({
    include: { PurchaseInvoiceItem: true },
    orderBy: { createdAt: 'desc' }
  })
}

export const deletePurchaseInvoiceService = async (invoice_number) => {
  await prisma.purchaseInvoiceItem.deleteMany({
    where: { invoice_number }
  })

  const deletedInvoice = await prisma.purchaseInvoice.delete({
    where: { invoice_number }
  })

  return deletedInvoice
}
