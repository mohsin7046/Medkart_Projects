import { prisma } from "../utilities/import.config.js";
import { piLogger } from "../utilities/logger.js";

export class PurchaseInvoiceRepository {
 
   async createInvoice( data, items) {
    try {
      return await prisma.purchaseInvoice.create({
        data: {
          ...data,
          PurchaseInvoiceItem: {
            create: data.PurchaseInvoiceItem
        },
      }
      });
      
    } catch (error) {
      piLogger.error("Error creating Purchase Invoice: " + error.message);
      throw error;
    }
  }


   async deleteInvoiceItems(invoice_id) {
    try {
      return await prisma.purchaseInvoiceItem.updateMany({
        where: { invoice_id },
        data: { deleted_at: new Date() },
      });
    } catch (error) {
      piLogger.error("Error deleting invoice items: " + error.message);
      throw error;
    }
  }

   async deleteInvoice(invoice_id) {
    try {
      return await prisma.purchaseInvoice.update({
        where: { id: invoice_id },
        data: { deleted_at: new Date() },
      });
    } catch (error) {
      piLogger.error("Error deleting invoice: " + error.message);
      throw error;
    }
  }

  
   async getInvoiceById(id) {
    try {
      return await prisma.purchaseInvoice.findUnique({
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
    } catch (error) {
      piLogger.error(`Error fetching invoice by ID (${id}) | ${error.message}`);
      throw error;
    }
  }
}
