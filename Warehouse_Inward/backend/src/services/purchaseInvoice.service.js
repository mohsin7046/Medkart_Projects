import { prisma } from '../utilities/import.config.js'
import { PREFIX, STATUS } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'
import { decimalConversion } from '../utilities/decimal.conversion.js'
import { piLogger } from '../utilities/logger.js'
import { purchaseInvoiceQueue, purchaseInvoiceQueueEvents } from '../cache/queueManager.js'
import { GRNRepository } from '../repository/grn.repository.js'
import { ProductRepository } from '../repository/product.repository.js'
import { PurchaseInvoiceRepository } from '../repository/purchaseInvoice.repository.js'

const grnRepo = new GRNRepository();
const productRepo = new ProductRepository();
const invoiceRepo = new PurchaseInvoiceRepository();

export const createPurchaseInvoiceService = async ({
  grn_id,
  invoice_date,
  items  
}) => {

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

    const existingGRN = await grnRepo.existingGRNById(grn_id);

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

    const products = await productRepo.getProducts({ids:productIds,select:{ id: true, gst_percentage: true }});

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
    const invoice_number = generateRandom(PREFIX.INVOICE);

    const module = 'invoice';
    const operation = 'create';
    const changeddata = {
      grn_id,
      invoice_number,
      invoice_date: new Date(invoice_date),
      total_amount,
      status: STATUS.PENDING,
      PurchaseInvoiceItem: itemsWithTotal
    }

    const job = await purchaseInvoiceQueue.add(`${module}:${operation}`, {
      module,
      operation,
      payload: { data: changeddata },
    }, {
      attempts: 3,
      backoff: { type: 'fixed', delay: 2000 },
      removeOnComplete: true,
    });

    const invoice = await job.waitUntilFinished(purchaseInvoiceQueueEvents);
    if (!invoice || invoice.status !== 'success') {
      throw new Error('Purchase Order not created');
    }

    await grnRepo.updateGRNStatus(grn_id, STATUS.COMPLETED);

    piLogger.info(
      `✅ Purchase Invoice ${invoice.id} created successfully for GRN ${grn_id}`
    );

    return invoice;
  })
}


export const deletePurchaseInvoiceService = async (invoice_id) => {
  if (!invoice_id) {
    piLogger.error('Invoice ID is missing during delete');
    throw new Error('Invoice ID is required');
  }

  const module = 'invoice';
  const operation = 'delete';

  const job = await purchaseInvoiceQueue.add(`${module}:${operation}`, {
    module,
    operation,
    payload: { invoice_id },
  }, {
    attempts: 3,
    backoff: { type: 'fixed', delay: 2000 },
    removeOnComplete: true,
  });

  const deletedInvoice = await job.waitUntilFinished(purchaseInvoiceQueueEvents);
  if (!deletedInvoice || deletedInvoice.status !== 'success') {
    throw new Error('Purchase Order not deleted');
  }

  piLogger.info(`🗑️ Purchase Invoice ${invoice_id} deleted successfully`);
  return deletedInvoice;
}


export const getInvoiceByIdService = async (id) => {
  if (!id) {
    piLogger.error('Invoice ID is missing while fetching by ID');
    throw new Error('Invoice ID is required');
  }

  const data = await invoiceRepo.getInvoiceById(id);

  if (!data) {
    piLogger.warn(`⚠️ Purchase Invoice not found for ID ${id}`);
    throw new Error('Purchase Invoice not found');
  }

  piLogger.info(`📄 Purchase Invoice ${id} fetched successfully`);
  return data;
};

