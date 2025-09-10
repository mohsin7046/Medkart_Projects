import { prisma } from '../utilities/import.config.js'
import { STATUS } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'
import { decimalConversion } from '../utilities/decimal.conversion.js'
import { piLogger } from '../utilities/logger.js'
import { cacheSet, cacheGet, cacheDelete, enqueue } from '../cache/redisClient.js';


export const createPurchaseInvoiceService = async ({
  grn_id,
  invoice_date,
  items
}) => {

  if (!grn_id || !invoice_date || !items?.length) {
    piLogger.error('Missing required fields while creating purchase invoice');
    throw new Error('All fields are required');
  }

  for (const item of items) {
    if (item.item_mrp < item.item_price) {
      piLogger.error(
        `Validation failed: MRP is less than price for product ${item.product_id}`
      );
      throw new Error(
        `MRP cannot be less than price for product ${item.product_id}`
      );
    }
  }

  return await prisma.$transaction(async (tx) => {
    const existingGRN = await tx.goodReceiptNote.findUnique({
      where: { id: grn_id },
    });

    if (!existingGRN) {
      piLogger.error('GRN does not exist for invoice creation');
      throw new Error('GRN does not exist');
    }

    if ([STATUS.COMPLETED, STATUS.CANCELLED].includes(existingGRN.status)) {
      piLogger.error(
        `Invoice creation blocked: GRN ${grn_id} already ${existingGRN.status}`
      );
      throw new Error('Purchase Invoice already created for this GRN');
    }

    const productIds = items.map((item) => item.product_id);
    const products = await tx.product.findMany({
      where: { id: { in: productIds }, deleted_at: null },
      select: { id: true, gst_percentage: true },
    });

    const productMap = products.reduce((obj, p) => {
      obj[p.id] = p.gst_percentage || 0;
      return obj;
    }, {});

    let total_amount = 0;
    const itemsWithTotal = items.map((item) => {
      const gst = productMap[item.product_id] || 0;
      const baseAmount = decimalConversion(item.quantity * item.item_price);
      const totalAmount = decimalConversion(
        baseAmount + (baseAmount * gst) / 100
      );
      total_amount += totalAmount;

      return { ...item, totalAmount };
    });

    total_amount = decimalConversion(total_amount);
    const invoice_number = generateRandom('INVOICE');

    const invoice = await tx.purchaseInvoice.create({
      data: {
        grn_id,
        invoice_number,
        invoice_date: new Date(invoice_date),
        total_amount,
        status: STATUS.PENDING,
        PurchaseInvoiceItem: {
          create: itemsWithTotal.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            item_price: item.item_price,
            item_mrp: item.item_mrp,
            totalAmount: item.totalAmount,
          })),
        },
      },
    });

    await tx.goodReceiptNote.update({
      where: { id: grn_id },
      data: { status: STATUS.COMPLETED },
    });

    piLogger.info(
      `✅ Purchase Invoice ${invoice.id} created successfully for GRN ${grn_id}`
    );
  

    await cacheSet(`purchaseInvoice:id:${invoice.id}`, invoice);
    await cacheSet(`purchaseInvoice:number:${invoice.invoice_number}`, invoice);
  
    await enqueue('purchaseInvoiceQueue', { action: 'create', invoice_id: invoice.id })
    return invoice;
  })
}


export const deletePurchaseInvoiceService = async (invoice_id) => {
  if (!invoice_id) {
    piLogger.error('Invoice ID is missing during delete');
    throw new Error('Invoice ID is required');
  }

  await prisma.purchaseInvoiceItem.updateMany({
    where: { invoice_id },
    data: { deleted_at: new Date() },
  });

  const deletedInvoice = await prisma.purchaseInvoice.update({
    where: { id: invoice_id },
    data: { deleted_at: new Date() },
  });

   await cacheDelete(`purchaseInvoice:id:${invoice_id}`);
  if (deletedInvoice.invoice_number) {
    await cacheDelete(`purchaseInvoice:number:${deletedInvoice.invoice_number}`);
  }
  await enqueue("purchaseInvoiceQueue", { action: "delete", invoice_id });

  piLogger.info(`🗑️ Purchase Invoice ${invoice_id} deleted successfully`);
  return deletedInvoice;
}


export const getInvoiceByIdService = async (id) => {
  if (!id) {
    piLogger.error('Invoice ID is missing while fetching by ID');
    throw new Error('Invoice ID is required');
  }

  // const cacheKey = `purchaseInvoice:id:${id}`;
  //   const cached = await cacheGet(cacheKey);
  //   if (cached) {
  //     grnLogger.info(`✅ Cache hit for GRN ID: ${id}`);
  //     return cached;
  //   }

  const data = await prisma.purchaseInvoice.findUnique({
    where: { id: parseInt(id) },
    include: {
      goodReceiptNote: { select: { grn_number: true } },
      PurchaseInvoiceItem: {
        select: {
          id: true,
          quantity: true,
          item_price: true,
          item_mrp: true,
          totalAmount: true,
          product_id: true,
          product: {
            select: { id: true, gst_percentage: true, name: true },
          },
        },
      },
    },
  });

  if (!data) {
    piLogger.warn(`⚠️ Purchase Invoice not found for ID ${id}`);
    throw new Error('Purchase Invoice not found');
  }

  // await cacheSet(cacheKey, data);
  // await cacheSet(`purchaseInvoice:number:${data.invoice_number}`, data);

  piLogger.info(`📄 Purchase Invoice ${id} fetched successfully`);
  return data;
};


