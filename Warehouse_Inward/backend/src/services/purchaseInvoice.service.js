import { prisma } from '../utilities/import.config.js'
import { STATUS } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'
import { decimalConversion } from '../utilities/decimal.conversion.js'

export const createPurchaseInvoiceService = async ({
  grn_id,
  invoice_date,
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
      select: { id: true, gst_percentage: true }
    })

    const productMap = products.reduce((obj, p) => {
      obj[p.id] = p.gst_percentage || 0
      return obj
    }, {})

    let total_amount = 0;

    const itemsWithTotal = items.map((item) => {
      const gst = productMap[item.product_id] || 0;

      const baseAmount = decimalConversion(item.quantity * item.item_price);

      const totalAmount = decimalConversion(baseAmount + (baseAmount * gst) / 100);

      total_amount += totalAmount;

      return {
        ...item,
        totalAmount,
      };
    });

    total_amount = decimalConversion(total_amount);

    const invoice_number = generateRandom('INVOICE')

    const invoice = await tx.purchaseInvoice.create({
      data: {
        grn_id,
        invoice_number,
        invoice_date: new Date(invoice_date),
        total_amount: total_amount,
        status: STATUS.PENDING,
        PurchaseInvoiceItem: {
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

    await tx.goodReceiptNote.update({
      where: { id: grn_id },
      data: { status: STATUS.COMPLETED }
    })

    return invoice
  })
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

